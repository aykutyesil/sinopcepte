package com.sinopcepte.auth;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.sinopcepte.TestHttp;

import tools.jackson.databind.JsonNode;

/** POST /api/auth/register: başarı + oturum, 409 çakışmalar, 400 doğrulama, CSRF. */
class RegistrationTest extends UserTestSupport {

    @Autowired
    AppUserRepository users;

    @Test
    void registerCreatesUserAndLogsIn() {
        String handle = uniqueHandle("Deniz");               // büyük harfli girilir
        String lower = handle.toLowerCase(java.util.Locale.ROOT);
        String email = "  " + handle.toUpperCase(java.util.Locale.ROOT) + "@Example.COM ";

        TestHttp http = csrfClient();
        String preToken = http.cookie("XSRF-TOKEN");
        TestHttp.Res res = http.sendWithCsrf("POST", "/api/auth/register",
                registerJson("  " + handle + " ", email, PASSWORD, true));

        assertThat(res.status()).as(res.body()).isEqualTo(201);
        JsonNode me = res.json();
        assertThat(keys(me)).containsExactlyInAnyOrder("username", "roles", "handle", "avatar");
        assertThat(me.get("handle").asString()).isEqualTo(lower);
        assertThat(me.get("username").asString()).isEqualTo(lower);
        assertThat(me.get("avatar").asString()).isEqualTo("marti");
        assertThat(me.get("roles").size()).isEqualTo(1);
        assertThat(me.get("roles").get(0).asString()).isEqualTo("USER");

        // Giriş ile aynı mekanik: oturum çerezi + yenilenmiş CSRF token'ı
        String session = res.setCookie("JSESSIONID");
        assertThat(session).as("oturum çerezi").isNotNull();
        assertThat(session.toLowerCase()).contains("httponly").contains("samesite=lax");
        assertThat(http.cookie("XSRF-TOKEN")).isNotBlank().isNotEqualTo(preToken);
        assertThat(http.send("PUT", "/api/me/profile",
                "{\"avatar\":\"kale\",\"checkinVisibility\":\"PUBLIC\",\"anonymousMode\":false}", preToken).status())
                .as("eski CSRF token'ı geçmez").isEqualTo(403);

        TestHttp.Res after = http.get("/api/auth/me");
        assertThat(after.status()).isEqualTo(200);
        assertThat(after.json().get("handle").asString()).isEqualTo(lower);

        AppUser saved = users.findByUsername(lower).orElseThrow();
        assertThat(saved.getEmail()).isEqualTo(lower + "@example.com");
        assertThat(saved.getRole()).isEqualTo(Role.USER);
        assertThat(saved.getPasswordHash()).startsWith("$2").doesNotContain(PASSWORD);
        assertThat(saved.getKvkkVersion()).isEqualTo("test-kvkk-1");
        assertThat(saved.getKvkkAcceptedAt()).isNotNull();
        assertThat(saved.getCheckinVisibility()).isEqualTo(CheckinVisibility.PUBLIC);
        assertThat(saved.isAnonymousMode()).isFalse();
    }

    @Test
    void registerWithoutCsrfIs403AndCreatesNothing() {
        String handle = uniqueHandle("nocsrf");
        TestHttp http = csrfClient();
        TestHttp.Res res = http.send("POST", "/api/auth/register",
                registerJson(handle, handle + "@example.com", PASSWORD, true), null);
        assertThat(res.status()).isEqualTo(403);
        assertThat(users.existsByUsername(handle)).isFalse();
        assertThat(http.get("/api/auth/me").status()).isEqualTo(401);
    }

    @Test
    void handleConflictIsCaseInsensitive409() {
        String handle = uniqueHandle("kaya");
        registered(handle, PASSWORD);

        TestHttp other = csrfClient();
        TestHttp.Res res = other.sendWithCsrf("POST", "/api/auth/register",
                registerJson(handle.toUpperCase(java.util.Locale.ROOT), "baska." + handle + "@example.com", PASSWORD, true));
        assertThat(res.status()).as(res.body()).isEqualTo(409);
        assertThat(errorFields(res)).containsExactly("handle");
        assertThat(res.json().get("message").asString()).isEqualTo("Bu rumuz zaten alınmış");
        assertThat(other.get("/api/auth/me").status()).as("çakışmada oturum açılmaz").isEqualTo(401);
        assertThat(users.existsByEmail("baska." + handle + "@example.com")).isFalse();
    }

    @Test
    void emailConflictIsCaseInsensitive409() {
        String first = uniqueHandle("eposta");
        registered(first, PASSWORD);

        TestHttp other = csrfClient();
        TestHttp.Res res = other.sendWithCsrf("POST", "/api/auth/register",
                registerJson(uniqueHandle("ikinci"), first.toUpperCase(java.util.Locale.ROOT) + "@EXAMPLE.com", PASSWORD, true));
        assertThat(res.status()).as(res.body()).isEqualTo(409);
        assertThat(errorFields(res)).containsExactly("email");
        assertThat(res.json().get("message").asString()).isEqualTo("Bu e-posta adresiyle kayıtlı bir hesap var");
    }

    record Invalid(String handle, String email, String password, Object kvkk, String field) {
    }

    @Test
    void invalidInputIs400WithFieldErrors() {
        String ok = uniqueHandle("gecerli");
        String okMail = ok + "@example.com";
        List<Invalid> cases = List.of(
                new Invalid("ab", okMail, PASSWORD, true, "handle"),                       // kısa
                new Invalid("a".repeat(21), okMail, PASSWORD, true, "handle"),             // uzun
                new Invalid("ali-veli", okMail, PASSWORD, true, "handle"),                 // tire
                new Invalid("çağrı55", okMail, PASSWORD, true, "handle"),                  // ASCII dışı
                new Invalid("ali veli", okMail, PASSWORD, true, "handle"),                 // boşluk
                new Invalid(null, okMail, PASSWORD, true, "handle"),
                new Invalid("admin", okMail, PASSWORD, true, "handle"),                    // ayrılmış
                new Invalid("Kayit", okMail, PASSWORD, true, "handle"),                    // ayrılmış (küçültülünce)
                new Invalid("moderator", okMail, PASSWORD, true, "handle"),
                new Invalid(ok, "eposta-degil", PASSWORD, true, "email"),
                new Invalid(ok, null, PASSWORD, true, "email"),
                new Invalid(ok, okMail, "1234567", true, "password"),                      // 7 karakter
                new Invalid(ok, okMail, null, true, "password"),
                new Invalid(ok, okMail, "ş".repeat(37), true, "password"),                 // 74 bayt > 72
                new Invalid(ok, okMail, PASSWORD, false, "kvkkAccepted"),
                new Invalid(ok, okMail, PASSWORD, null, "kvkkAccepted"));
        TestHttp http = csrfClient();
        for (Invalid c : cases) {
            TestHttp.Res res = http.sendWithCsrf("POST", "/api/auth/register",
                    registerJson(c.handle(), c.email(), c.password(), c.kvkk()));
            assertThat(res.status()).as("%s → %s", c, res.body()).isEqualTo(400);
            assertThat(errorFields(res)).as(c.toString()).containsExactly(c.field());
        }
        assertThat(users.existsByUsername(ok)).as("hiçbir hatalı istek kayıt oluşturmaz").isFalse();
        assertThat(http.get("/api/auth/me").status()).isEqualTo(401);

        // Tüm alanlar hatalı → hepsi tek yanıtta
        TestHttp.Res all = http.sendWithCsrf("POST", "/api/auth/register", "{}");
        assertThat(all.status()).isEqualTo(400);
        assertThat(errorFields(all)).isEqualTo(Set.of("handle", "email", "password", "kvkkAccepted"));
        assertThat(all.json().get("status").asInt()).isEqualTo(400);
    }

    @Test
    void boundaryValuesAreAccepted() {
        // 3 karakter (alt sınır), 20 karakter (üst sınır), nokta/alt çizgi/rakam;
        // "ISIL_..." Türkçe yerelde "ısıl_..." olurdu → Locale.ROOT ile "isil_..." kalmalı.
        String twenty = uniqueHandle("a.b");
        twenty = twenty + "x".repeat(20 - twenty.length());
        for (String h : List.of("z9_", twenty, uniqueHandle("ISIL"))) {
            TestHttp http = csrfClient();
            String expected = h.toLowerCase(java.util.Locale.ROOT);
            TestHttp.Res res = http.sendWithCsrf("POST", "/api/auth/register",
                    registerJson(h, expected + "@example.com", "12345678", true));   // 8 karakter (alt sınır)
            assertThat(res.status()).as("%s → %s", h, res.body()).isEqualTo(201);
            assertThat(res.json().get("handle").asString()).isEqualTo(expected).doesNotContain("ı");
        }
        // 72 bayt şifre (üst sınır) kabul edilir
        String h = uniqueHandle("uzunsifre");
        TestHttp http = csrfClient();
        assertThat(http.sendWithCsrf("POST", "/api/auth/register",
                registerJson(h, h + "@example.com", "ş".repeat(36), true)).status()).isEqualTo(201);
    }
}
