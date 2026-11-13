package com.sinopcepte.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Locale;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;

import com.sinopcepte.TestHttp;

import tools.jackson.databind.JsonNode;

/** Rumuz/e-posta ile giriş, USER → admin 403, V10 sonrası admin, DB düzeyinde küçük harf/tekillik. */
class LoginTest extends UserTestSupport {

    @Autowired
    AppUserRepository users;

    @Autowired
    JdbcTemplate jdbc;

    @Test
    void loginByHandleOrEmailCaseInsensitive() {
        String handle = uniqueHandle("giris");
        registered(handle, PASSWORD);

        for (String login : new String[] {handle, handle.toUpperCase(Locale.ROOT), " " + handle + " ",
                handle + "@example.com", handle.toUpperCase(Locale.ROOT) + "@Example.COM"}) {
            TestHttp http = csrfClient();
            TestHttp.Res res = http.sendWithCsrf("POST", "/api/auth/login", loginJson(login, PASSWORD));
            assertThat(res.status()).as("giriş: '%s' → %s", login, res.body()).isEqualTo(200);
            JsonNode me = res.json();
            assertThat(keys(me)).containsExactlyInAnyOrder("username", "roles", "handle", "avatar");
            // e-postayla girilse de kimlik adı rumuzdur
            assertThat(me.get("username").asString()).isEqualTo(handle);
            assertThat(me.get("handle").asString()).isEqualTo(handle);
            assertThat(http.get("/api/auth/me").json().get("handle").asString()).isEqualTo(handle);
        }

        TestHttp wrong = csrfClient();
        assertThat(wrong.sendWithCsrf("POST", "/api/auth/login", loginJson(handle + "@example.com", "yanlis-sifre"))
                .status()).isEqualTo(401);
    }

    @Test
    void registeredUserGets403OnAdminEndpoints() {
        TestHttp http = registered(uniqueHandle("normal"), PASSWORD);
        assertThat(http.sendWithCsrf("POST", "/api/admin/items", "{\"category\":\"mekan\",\"title\":\"X\"}").status())
                .isEqualTo(403);
        assertThat(http.sendWithCsrf("DELETE", "/api/admin/items/m-1", null).status()).isEqualTo(403);
        assertThat(http.sendWithCsrf("PUT", "/api/admin/events/ev-1", "{\"title\":\"X\"}").status()).isEqualTo(403);
        assertThat(http.get("/api/items").json().size()).isEqualTo(15);
    }

    @Test
    void adminLoginStillWorksAfterV10() {
        Integer applied = jdbc.queryForObject(
                "select count(*) from flyway_schema_history where version = '10' and success", Integer.class);
        assertThat(applied).isEqualTo(1);

        TestHttp http = csrfClient();
        TestHttp.Res res = http.sendWithCsrf("POST", "/api/auth/login",
                loginJson(ADMIN_USER.toUpperCase(Locale.ROOT), ADMIN_PASS));
        assertThat(res.status()).as(res.body()).isEqualTo(200);
        JsonNode me = res.json();
        assertThat(keys(me)).containsExactlyInAnyOrder("username", "roles", "handle", "avatar");
        assertThat(me.get("username").asString()).isEqualTo(ADMIN_USER);
        assertThat(me.get("handle").asString()).isEqualTo(ADMIN_USER);
        assertThat(me.get("avatar").asString()).isEqualTo("marti");
        assertThat(me.get("roles").size()).isEqualTo(1);
        assertThat(me.get("roles").get(0).asString()).isEqualTo("ADMIN");

        AppUser admin = users.findByUsername(ADMIN_USER).orElseThrow();
        assertThat(admin.getEmail()).isNull();
        assertThat(admin.getKvkkAcceptedAt()).isNull();

        TestHttp.Res own = http.get("/api/me/profile");
        assertThat(own.status()).isEqualTo(200);
        assertThat(own.json().get("email").isNull()).isTrue();
        assertThat(own.json().get("roles").get(0).asString()).isEqualTo("ADMIN");
    }

    @Test
    void databaseEnforcesLowercaseAndCaseInsensitiveUniqueness() {
        String indexes = String.join(" | ", jdbc.queryForList(
                "select indexdef from pg_indexes where tablename = 'app_user' and indexname in "
                        + "('app_user_username_lower_uq', 'app_user_email_lower_uq') order by indexname", String.class));
        assertThat(indexes).contains("UNIQUE", "lower((email)", "lower((username)");

        String insert = "insert into app_user (username, password_hash, role, email) values (?, 'x', 'USER', ?)";
        String h = uniqueHandle("dbtest");
        assertThatThrownBy(() -> jdbc.update(insert, h.toUpperCase(Locale.ROOT), null))
                .as("büyük harfli rumuz DB'de reddedilir").isInstanceOf(DataIntegrityViolationException.class);
        assertThatThrownBy(() -> jdbc.update(insert, h, "Buyuk@Example.com"))
                .as("büyük harfli e-posta DB'de reddedilir").isInstanceOf(DataIntegrityViolationException.class);
        jdbc.update(insert, h, h + "@example.com");
        try {
            assertThatThrownBy(() -> jdbc.update(insert, uniqueHandle("dbtest"), h + "@example.com"))
                    .isInstanceOf(DataIntegrityViolationException.class);
        } finally {
            jdbc.update("delete from app_user where username = ?", h);
        }
    }
}
