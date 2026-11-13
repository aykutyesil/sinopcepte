package com.sinopcepte.auth;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Set;
import java.util.TreeSet;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicInteger;

import com.sinopcepte.IntegrationTestBase;
import com.sinopcepte.TestHttp;

import tools.jackson.databind.JsonNode;

/** N7 testleri için ortak yardımcılar: tekil rumuz üretimi, kayıt, JSON anahtar kümesi. */
public abstract class UserTestSupport extends IntegrationTestBase {

    public static final String PASSWORD = "deniz-feneri-57";
    private static final AtomicInteger SEQ = new AtomicInteger();

    /** prefix + tekil sonek; 20 karakteri aşmaz, kurallara uyar. */
    protected static String uniqueHandle(String prefix) {
        String suffix = Integer.toString(SEQ.incrementAndGet(), 36)
                + Integer.toString(ThreadLocalRandom.current().nextInt(36 * 36 * 36), 36);
        String h = prefix + "_" + suffix;
        assertThat(h.length()).as("test rumuzu uzunluğu").isBetween(3, 20);
        return h;
    }

    protected static String registerJson(String handle, String email, String password, Object kvkkAccepted) {
        return "{\"handle\":" + q(handle) + ",\"email\":" + q(email) + ",\"password\":" + q(password)
                + ",\"kvkkAccepted\":" + kvkkAccepted + "}";
    }

    protected static String loginJson(String username, String password) {
        return "{\"username\":" + q(username) + ",\"password\":" + q(password) + "}";
    }

    protected static String q(String s) {
        if (s == null) {
            return "null";
        }
        return "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
    }

    /** Yeni istemci (ayrı IP), CSRF çerezi alınmış. */
    protected TestHttp csrfClient() {
        TestHttp http = newClient();
        assertThat(http.get("/api/auth/csrf").status()).isEqualTo(204);
        return http;
    }

    /** Kayıt olmuş ve oturum açmış istemci. */
    protected TestHttp registered(String handle, String password) {
        TestHttp http = csrfClient();
        TestHttp.Res res = http.sendWithCsrf("POST", "/api/auth/register",
                registerJson(handle, handle + "@example.com", password, true));
        assertThat(res.status()).as(res.body()).isEqualTo(201);
        return http;
    }

    protected TestHttp loggedIn(String username, String password) {
        TestHttp http = csrfClient();
        TestHttp.Res res = http.sendWithCsrf("POST", "/api/auth/login", loginJson(username, password));
        assertThat(res.status()).as(res.body()).isEqualTo(200);
        return http;
    }

    protected static Set<String> keys(JsonNode node) {
        Set<String> out = new TreeSet<>();
        node.properties().forEach(e -> out.add(e.getKey()));
        return out;
    }

    /** {@code errors} dizisindeki alan adları. */
    protected static Set<String> errorFields(TestHttp.Res res) {
        Set<String> out = new TreeSet<>();
        JsonNode errors = res.json().get("errors");
        assertThat(errors).as("errors dizisi: " + res.body()).isNotNull();
        errors.forEach(e -> {
            out.add(e.get("field").asString());
            assertThat(e.get("message").asString()).as("Türkçe mesaj").isNotBlank();
        });
        return out;
    }
}
