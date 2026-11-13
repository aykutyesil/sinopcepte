package com.sinopcepte.auth;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.OffsetDateTime;
import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.sinopcepte.IntegrationTestBase;
import com.sinopcepte.TestHttp;
import com.sinopcepte.catalog.ItemRepository;
import com.sinopcepte.catalog.LiveEventRepository;

/** Her /api/admin/** metodu oturumsuz 401 (JSON) döner; asla yönlendirme yapmaz ve veriyi değiştirmez. */
class AdminSecurityTest extends IntegrationTestBase {

    record Call(String method, String path, String body) {
    }

    private static final String ITEM = """
            {"category":"mekan","title":"Yetkisiz Kart"}""";
    private static final String EVENT = """
            {"title":"Yetkisiz Etkinlik"}""";

    /** API sözleşmesindeki tüm admin uçları. */
    private static final List<Call> ADMIN_CALLS = List.of(
            new Call("POST", "/api/admin/items", ITEM),
            new Call("PUT", "/api/admin/items/m-1", ITEM),
            new Call("DELETE", "/api/admin/items/m-1", null),
            new Call("POST", "/api/admin/events", EVENT),
            new Call("PUT", "/api/admin/events/ev-1", EVENT),
            new Call("DELETE", "/api/admin/events/ev-1", null));

    @Autowired
    ItemRepository items;

    @Autowired
    LiveEventRepository events;

    @Autowired
    AppUserRepository users;

    @Autowired
    PasswordEncoder encoder;

    @AfterEach
    void removeTestUser() {
        users.findByUsername("normal-kullanici").ifPresent(users::delete);
    }

    private static void assertJson401(TestHttp.Res res, Call c) {
        assertThat(res.status()).as("%s %s", c.method(), c.path()).isEqualTo(401);
        assertThat(res.raw().headers().firstValue("location")).as("yönlendirme yok").isEmpty();
        assertThat(res.raw().headers().firstValue("content-type").orElse("")).contains("application/json");
        assertThat(res.json().get("status").asInt()).isEqualTo(401);
    }

    @Test
    void everyAdminCallWithoutSessionOrCsrfIs401() {
        for (Call c : ADMIN_CALLS) {
            assertJson401(newClient().send(c.method(), c.path(), c.body(), null), c);
        }
        assertThat(items.count()).isEqualTo(15);
        assertThat(events.count()).isEqualTo(4);
    }

    @Test
    void everyAdminCallWithValidCsrfButNoSessionIs401() {
        for (Call c : ADMIN_CALLS) {
            TestHttp http = newClient();
            assertThat(http.get("/api/auth/csrf").status()).isEqualTo(204);
            assertThat(http.cookie("XSRF-TOKEN")).isNotBlank();
            assertJson401(http.sendWithCsrf(c.method(), c.path(), c.body()), c);
        }
        assertThat(items.count()).isEqualTo(15);
        assertThat(events.count()).isEqualTo(4);
    }

    @Test
    void meAndLogoutWithoutSessionAre401() {
        TestHttp http = newClient();
        assertThat(http.get("/api/auth/me").status()).isEqualTo(401);
        http.get("/api/auth/csrf");
        assertThat(http.sendWithCsrf("POST", "/api/auth/logout", null).status()).isEqualTo(401);
    }

    @Test
    void nonAdminUserGets403OnAdminEndpoints() {
        users.save(new AppUser("normal-kullanici", encoder.encode("normal-parola-456"), Role.USER, OffsetDateTime.now()));
        TestHttp http = newClient();
        http.get("/api/auth/csrf");
        TestHttp.Res login = http.sendWithCsrf("POST", "/api/auth/login",
                "{\"username\":\"normal-kullanici\",\"password\":\"normal-parola-456\"}");
        assertThat(login.status()).isEqualTo(200);
        assertThat(login.json().get("roles").get(0).asString()).isEqualTo("USER");

        for (Call c : ADMIN_CALLS) {
            TestHttp.Res res = http.sendWithCsrf(c.method(), c.path(), c.body());
            assertThat(res.status()).as("%s %s", c.method(), c.path()).isEqualTo(403);
        }
        assertThat(items.count()).isEqualTo(15);
        assertThat(events.count()).isEqualTo(4);
    }
}
