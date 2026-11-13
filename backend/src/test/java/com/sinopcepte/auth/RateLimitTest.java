package com.sinopcepte.auth;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import com.sinopcepte.TestHttp;

/**
 * IP başına hız sınırı. Test profilinde: giriş 3 başarısız / 10 dk, kayıt 3 / saat.
 * IP = X-Forwarded-For'un sağdan ilk iç olmayan girdisi (server.forward-headers-strategy=native, test istemcisi 127.0.0.1 = iç vekil).
 */
class RateLimitTest extends UserTestSupport {

    private static final int LOGIN_MAX = 3;
    private static final int REGISTER_MAX = 3;

    /** Aynı IP'den gelen ama çerez kavanozu ayrı yeni bir "tarayıcı". */
    private TestHttp clientFrom(String ip) {
        TestHttp http = new TestHttp("http://localhost:" + port, ip);
        assertThat(http.get("/api/auth/csrf").status()).isEqualTo(204);
        return http;
    }

    private static void assert429(TestHttp.Res res) {
        assertThat(res.status()).as(res.body()).isEqualTo(429);
        assertThat(res.json().get("status").asInt()).isEqualTo(429);
        assertThat(res.json().get("message").asString()).contains("Çok fazla deneme");
        long retry = Long.parseLong(res.raw().headers().firstValue("retry-after").orElseThrow());
        assertThat(retry).isPositive().isLessThanOrEqualTo(3600);
    }

    @Test
    void failedLoginsAreLimitedPerIpEvenForCorrectPassword() {
        String handle = uniqueHandle("kaba");
        registered(handle, PASSWORD);
        String ip = TestHttp.nextIp();

        TestHttp http = clientFrom(ip);
        for (int i = 0; i < LOGIN_MAX; i++) {
            assertThat(http.sendWithCsrf("POST", "/api/auth/login", loginJson(handle, "yanlis-" + i)).status())
                    .as("deneme %d", i + 1).isEqualTo(401);
        }
        // Sınır doldu: doğru şifre de 429 alır, oturum açılmaz
        assert429(http.sendWithCsrf("POST", "/api/auth/login", loginJson(handle, PASSWORD)));
        assertThat(http.get("/api/auth/me").status()).isEqualTo(401);
        // Aynı IP'den yeni çerezlerle de 429
        assert429(clientFrom(ip).sendWithCsrf("POST", "/api/auth/login", loginJson(handle, PASSWORD)));

        // Başka IP etkilenmez (sayaç IP başına, X-Forwarded-For'a göre)
        TestHttp other = clientFrom(TestHttp.nextIp());
        assertThat(other.sendWithCsrf("POST", "/api/auth/login", loginJson(handle, PASSWORD)).status()).isEqualTo(200);
    }

    /**
     * Saldırgan X-Forwarded-For'un soluna her denemede başka sahte IP yazar; vekil gerçek IP'yi sağa ekler.
     * Sayaç sağdaki (güvenilir vekilin yazdığı) IP'ye göre tutulmalı → sınır aşılamaz.
     */
    @Test
    void spoofedLeftmostForwardedForDoesNotBypassLimit() {
        String handle = uniqueHandle("sahte");
        registered(handle, PASSWORD);
        String realIp = TestHttp.nextIp();

        for (int i = 0; i < LOGIN_MAX; i++) {
            String chain = TestHttp.nextIp() + ", " + realIp;
            assertThat(clientFrom(chain).sendWithCsrf("POST", "/api/auth/login", loginJson(handle, "yanlis-" + i)).status())
                    .as("deneme %d", i + 1).isEqualTo(401);
        }
        assert429(clientFrom(TestHttp.nextIp() + ", " + realIp)
                .sendWithCsrf("POST", "/api/auth/login", loginJson(handle, PASSWORD)));
    }

    @Test
    void successfulLoginsDoNotCount() {
        String handle = uniqueHandle("basarili");
        registered(handle, PASSWORD);
        String ip = TestHttp.nextIp();

        for (int i = 0; i < LOGIN_MAX + 2; i++) {
            assertThat(clientFrom(ip).sendWithCsrf("POST", "/api/auth/login", loginJson(handle, PASSWORD)).status())
                    .as("başarılı giriş %d", i + 1).isEqualTo(200);
        }
        TestHttp http = clientFrom(ip);
        for (int i = 0; i < LOGIN_MAX - 1; i++) {
            assertThat(http.sendWithCsrf("POST", "/api/auth/login", loginJson(handle, "yanlis")).status()).isEqualTo(401);
        }
        assertThat(clientFrom(ip).sendWithCsrf("POST", "/api/auth/login", loginJson(handle, PASSWORD)).status())
                .as("sınırın altında doğru şifre geçer").isEqualTo(200);
        assertThat(http.sendWithCsrf("POST", "/api/auth/login", loginJson(handle, "yanlis")).status()).isEqualTo(401);
        assert429(http.sendWithCsrf("POST", "/api/auth/login", loginJson(handle, PASSWORD)));
    }

    @Test
    void registrationsAreLimitedPerIp() {
        String ip = TestHttp.nextIp();
        // Doğrulama hatası (400) sayılmaz
        for (int i = 0; i < REGISTER_MAX + 1; i++) {
            assertThat(clientFrom(ip).sendWithCsrf("POST", "/api/auth/register",
                    registerJson("x", "gecersiz", "kisa", false)).status()).isEqualTo(400);
        }
        for (int i = 0; i < REGISTER_MAX; i++) {
            String h = uniqueHandle("seri");
            assertThat(clientFrom(ip).sendWithCsrf("POST", "/api/auth/register",
                    registerJson(h, h + "@example.com", PASSWORD, true)).status()).as("kayıt %d", i + 1).isEqualTo(201);
        }
        String blocked = uniqueHandle("seri");
        assert429(clientFrom(ip).sendWithCsrf("POST", "/api/auth/register",
                registerJson(blocked, blocked + "@example.com", PASSWORD, true)));
        TestHttp check = clientFrom(TestHttp.nextIp());
        assertThat(check.get("/api/users/" + blocked).status()).as("429'da kayıt oluşmaz").isEqualTo(404);

        // Başka IP kayıt olabilir
        assertThat(check.sendWithCsrf("POST", "/api/auth/register",
                registerJson(blocked, blocked + "@example.com", PASSWORD, true)).status()).isEqualTo(201);
    }
}
