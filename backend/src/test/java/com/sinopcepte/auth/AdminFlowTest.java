package com.sinopcepte.auth;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.sinopcepte.IntegrationTestBase;
import com.sinopcepte.TestHttp;
import com.sinopcepte.catalog.ItemRepository;
import com.sinopcepte.catalog.LiveEventRepository;

import tools.jackson.databind.JsonNode;

/**
 * Tarayıcıdaki akışın aynısı: CSRF çerezi al → giriş → CRUD → çıkış.
 * CSRF başlığı her istekte o anki XSRF-TOKEN çerezinden okunur (SPA istemcisi gibi).
 */
class AdminFlowTest extends IntegrationTestBase {

    private static final String LOGIN = "{\"username\":\"" + ADMIN_USER + "\",\"password\":\"" + ADMIN_PASS + "\"}";

    @Autowired
    ItemRepository items;

    @Autowired
    LiveEventRepository events;

    @Autowired
    AppUserRepository users;

    private TestHttp loggedInAdmin() {
        TestHttp http = newClient();
        assertThat(http.get("/api/auth/csrf").status()).isEqualTo(204);
        TestHttp.Res login = http.sendWithCsrf("POST", "/api/auth/login", LOGIN);
        assertThat(login.status()).as(login.body()).isEqualTo(200);
        return http;
    }

    private static List<String> ids(JsonNode array) {
        List<String> out = new ArrayList<>();
        array.forEach(n -> out.add(n.get("id").asString()));
        return out;
    }

    @Test
    void adminWasBootstrappedFromEnvWithBcrypt() {
        AppUser admin = users.findByUsername(ADMIN_USER).orElseThrow();
        assertThat(admin.getRole()).isEqualTo(Role.ADMIN);
        assertThat(admin.getPasswordHash()).startsWith("$2").isNotEqualTo(ADMIN_PASS);
        assertThat(admin.getCreatedAt()).isNotNull();
    }

    @Test
    void cookiesHaveExpectedAttributes() {
        TestHttp http = newClient();
        TestHttp.Res csrf = http.get("/api/auth/csrf");
        String xsrf = csrf.setCookie("XSRF-TOKEN");
        assertThat(xsrf).isNotNull();
        assertThat(xsrf.toLowerCase()).doesNotContain("httponly").contains("samesite=lax");

        TestHttp.Res login = http.sendWithCsrf("POST", "/api/auth/login", LOGIN);
        assertThat(login.status()).isEqualTo(200);
        String session = login.setCookie("JSESSIONID");
        assertThat(session).as("oturum çerezi").isNotNull();
        assertThat(session.toLowerCase()).contains("httponly").contains("samesite=lax");
    }

    @Test
    void fullAdminCrudFlowWithCsrf() throws Exception {
        TestHttp http = newClient();
        assertThat(http.get("/api/auth/csrf").status()).isEqualTo(204);
        String preLoginToken = http.cookie("XSRF-TOKEN");
        assertThat(preLoginToken).isNotBlank();

        TestHttp.Res login = http.sendWithCsrf("POST", "/api/auth/login", LOGIN);
        assertThat(login.status()).isEqualTo(200);
        assertThat(login.json().get("username").asString()).isEqualTo(ADMIN_USER);
        assertThat(login.json().get("roles").get(0).asString()).isEqualTo("ADMIN");
        assertThat(login.json().get("roles").size()).isEqualTo(1);

        // Girişte CSRF token'ı yenilenir; eski token artık geçmez.
        String postLoginToken = http.cookie("XSRF-TOKEN");
        assertThat(postLoginToken).isNotBlank().isNotEqualTo(preLoginToken);
        assertThat(http.send("POST", "/api/admin/items", "{\"category\":\"mekan\",\"title\":\"X\"}", preLoginToken)
                .status()).isEqualTo(403);

        TestHttp.Res me = http.get("/api/auth/me");
        assertThat(me.status()).isEqualTo(200);
        assertThat(me.json().get("username").asString()).isEqualTo(ADMIN_USER);
        assertThat(me.json().get("roles").get(0).asString()).isEqualTo("ADMIN");

        String createdId = null;
        try {
            // Oluştur (id yok → sunucu üretir)
            TestHttp.Res created = http.sendWithCsrf("POST", "/api/admin/items", """
                    {"category":"tekel","title":"Gece Büfesi","badge":"🟢 Açık","location":"📍 Liman",
                     "desc":"Test kartı","phone":"05440000000","wa":"905440000000","rating":"4.5"}""");
            assertThat(created.status()).as(created.body()).isEqualTo(201);
            createdId = created.json().get("id").asString();
            assertThat(createdId).matches("item-[0-9a-f]{8}");
            assertThat(created.json().get("title").asString()).isEqualTo("Gece Büfesi");

            // Listede en sonda görünür
            JsonNode list = http.get("/api/items").json();
            assertThat(list.size()).isEqualTo(16);
            assertThat(list.get(15).get("id").asString()).isEqualTo(createdId);
            assertThat(list.get(15).get("desc").asString()).isEqualTo("Test kartı");
            assertThat(list.get(15).has("sortOrder")).isFalse();
            assertThat(ids(http.get("/api/items?category=tekel").json())).endsWith(createdId);

            // Güncelle
            TestHttp.Res updated = http.sendWithCsrf("PUT", "/api/admin/items/" + createdId, """
                    {"category":"tekel","title":"Gece Büfesi (Güncel)","rating":"4.7"}""");
            assertThat(updated.status()).as(updated.body()).isEqualTo(200);
            JsonNode afterUpdate = http.get("/api/items").json().get(15);
            assertThat(afterUpdate.get("id").asString()).isEqualTo(createdId);
            assertThat(afterUpdate.get("title").asString()).isEqualTo("Gece Büfesi (Güncel)");
            assertThat(afterUpdate.get("rating").asString()).isEqualTo("4.7");

            // Geçersiz kategori → 400, kayıt değişmez
            TestHttp.Res bad = http.sendWithCsrf("PUT", "/api/admin/items/" + createdId,
                    "{\"category\":\"bar\",\"title\":\"Olmaz\"}");
            assertThat(bad.status()).isEqualTo(400);
            assertThat(http.get("/api/items").json().get(15).get("title").asString()).isEqualTo("Gece Büfesi (Güncel)");

            // Oturum açıkken CSRF başlığı olmadan yazma → 403
            TestHttp.Res noCsrf = http.send("DELETE", "/api/admin/items/" + createdId, null, null);
            assertThat(noCsrf.status()).isEqualTo(403);
            TestHttp.Res noCsrfPost = http.send("POST", "/api/admin/items",
                    "{\"category\":\"mekan\",\"title\":\"CSRF'siz\"}", null);
            assertThat(noCsrfPost.status()).isEqualTo(403);
            assertThat(items.count()).isEqualTo(16);

            // Sil
            assertThat(http.sendWithCsrf("DELETE", "/api/admin/items/" + createdId, null).status()).isEqualTo(204);
            assertThat(ids(http.get("/api/items").json())).doesNotContain(createdId).hasSize(15);
            assertThat(http.sendWithCsrf("DELETE", "/api/admin/items/" + createdId, null).status()).isEqualTo(404);
            createdId = null;
        } finally {
            if (createdId != null) {
                items.deleteById(createdId);
            }
        }

        // Çıkış: oturum biter, me → 401
        assertThat(http.sendWithCsrf("POST", "/api/auth/logout", null).status()).isEqualTo(204);
        assertThat(http.get("/api/auth/me").status()).isEqualTo(401);
    }

    @Test
    void eventCrudFlowWithCsrf() {
        TestHttp http = loggedInAdmin();
        String autoId = null;
        try {
            TestHttp.Res created = http.sendWithCsrf("POST", "/api/admin/events", """
                    {"title":"Kalede Caz","venue":"Kale Burç Cafe Bar","location":"Tarihi Sinop Kalesi",
                     "date":"Cumartesi • 21:00","badge":"🎷 CAZ","desc":"Test","wa":"905555555555"}""");
            assertThat(created.status()).as(created.body()).isEqualTo(201);
            autoId = created.json().get("id").asString();
            assertThat(autoId).matches("ev-[0-9a-f]{8}");

            JsonNode list = http.get("/api/events").json();
            assertThat(list.size()).isEqualTo(5);
            assertThat(list.get(4).get("id").asString()).isEqualTo(autoId);
            assertThat(list.get(4).get("date").asString()).isEqualTo("Cumartesi • 21:00");

            TestHttp.Res updated = http.sendWithCsrf("PUT", "/api/admin/events/" + autoId,
                    "{\"title\":\"Kalede Caz Gecesi\",\"date\":\"Pazar • 21:00\"}");
            assertThat(updated.status()).isEqualTo(200);
            assertThat(http.get("/api/events").json().get(4).get("title").asString()).isEqualTo("Kalede Caz Gecesi");

            assertThat(http.sendWithCsrf("DELETE", "/api/admin/events/" + autoId, null).status()).isEqualTo(204);
            assertThat(ids(http.get("/api/events").json())).containsExactly("ev-1", "ev-2", "ev-3", "ev-4");
            autoId = null;

            // id verilirse kullanılır; aynı id ikinci kez → 409
            TestHttp.Res withId = http.sendWithCsrf("POST", "/api/admin/events", "{\"id\":\"ev-test\",\"title\":\"A\"}");
            assertThat(withId.status()).isEqualTo(201);
            assertThat(withId.json().get("id").asString()).isEqualTo("ev-test");
            assertThat(http.sendWithCsrf("POST", "/api/admin/events", "{\"id\":\"ev-test\",\"title\":\"B\"}").status())
                    .isEqualTo(409);
            assertThat(http.sendWithCsrf("DELETE", "/api/admin/events/ev-test", null).status()).isEqualTo(204);
        } finally {
            if (autoId != null) {
                events.deleteById(autoId);
            }
            if (events.existsById("ev-test")) {
                events.deleteById("ev-test");
            }
        }
    }

    @Test
    void wrongPasswordIs401() {
        TestHttp http = newClient();
        http.get("/api/auth/csrf");
        TestHttp.Res res = http.sendWithCsrf("POST", "/api/auth/login",
                "{\"username\":\"" + ADMIN_USER + "\",\"password\":\"yanlis-parola\"}");
        assertThat(res.status()).isEqualTo(401);
        assertThat(res.json().get("status").asInt()).isEqualTo(401);
        assertThat(http.get("/api/auth/me").status()).isEqualTo(401);

        TestHttp.Res unknown = http.sendWithCsrf("POST", "/api/auth/login",
                "{\"username\":\"olmayan\",\"password\":\"x\"}");
        assertThat(unknown.status()).isEqualTo(401);
    }

    @Test
    void loginWithoutCsrfIsRejected() {
        TestHttp http = newClient();
        http.get("/api/auth/csrf");
        TestHttp.Res res = http.send("POST", "/api/auth/login", LOGIN, null);
        assertThat(res.status()).isEqualTo(403);
        assertThat(http.get("/api/auth/me").status()).isEqualTo(401);
    }

    @Test
    void csrfEndpointCanBeCalledAgainAfterLogin() {
        TestHttp http = loggedInAdmin();
        assertThat(http.get("/api/auth/csrf").status()).isEqualTo(204);
        TestHttp.Res created = http.sendWithCsrf("POST", "/api/admin/events", "{\"title\":\"Geçici\"}");
        assertThat(created.status()).isEqualTo(201);
        String id = created.json().get("id").asString();
        assertThat(http.sendWithCsrf("DELETE", "/api/admin/events/" + id, null).status()).isEqualTo(204);
    }
}
