package com.sinopcepte.user;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.event.ApplicationEvents;
import org.springframework.test.context.event.RecordApplicationEvents;

import com.sinopcepte.TestHttp;
import com.sinopcepte.auth.AppUser;
import com.sinopcepte.auth.AppUserRepository;
import com.sinopcepte.auth.UserAccountService;
import com.sinopcepte.auth.UserDeletionEvent;
import com.sinopcepte.auth.UserTestSupport;

/** PUT /api/me/password ve DELETE /api/me. */
@RecordApplicationEvents
class AccountTest extends UserTestSupport {

    private static final String NEW_PASSWORD = "yeni-sifre-2026";

    @Autowired
    AppUserRepository users;

    @Autowired
    UserAccountService accounts;

    @Autowired
    ApplicationEvents applicationEvents;

    private static String pw(String current, String next) {
        return "{\"currentPassword\":" + q(current) + ",\"newPassword\":" + q(next) + "}";
    }

    @Test
    void changePasswordRequiresCurrentPassword() {
        String handle = uniqueHandle("sifre");
        TestHttp http = registered(handle, PASSWORD);
        String oldHash = users.findByUsername(handle).orElseThrow().getPasswordHash();

        TestHttp.Res wrong = http.sendWithCsrf("PUT", "/api/me/password", pw("yanlis-mevcut", NEW_PASSWORD));
        assertThat(wrong.status()).as(wrong.body()).isEqualTo(401);
        assertThat(errorFields(wrong)).containsExactly("currentPassword");
        assertThat(wrong.json().get("message").asString()).isEqualTo("Mevcut şifre hatalı");

        TestHttp.Res shortNew = http.sendWithCsrf("PUT", "/api/me/password", pw(PASSWORD, "kisa"));
        assertThat(shortNew.status()).isEqualTo(400);
        assertThat(errorFields(shortNew)).containsExactly("newPassword");

        TestHttp.Res missing = http.sendWithCsrf("PUT", "/api/me/password", pw(null, NEW_PASSWORD));
        assertThat(missing.status()).isEqualTo(400);
        assertThat(errorFields(missing)).containsExactly("currentPassword");

        assertThat(users.findByUsername(handle).orElseThrow().getPasswordHash())
                .as("başarısız denemeler şifreyi değiştirmez").isEqualTo(oldHash);
        assertThat(http.get("/api/auth/me").status()).as("401 oturumu düşürmez").isEqualTo(200);

        String sessionBefore = http.cookie("JSESSIONID");
        TestHttp.Res ok = http.sendWithCsrf("PUT", "/api/me/password", pw(PASSWORD, NEW_PASSWORD));
        assertThat(ok.status()).as(ok.body()).isEqualTo(204);
        assertThat(http.cookie("JSESSIONID")).as("oturum kimliği yenilenir").isNotEqualTo(sessionBefore);
        assertThat(http.get("/api/auth/me").status()).isEqualTo(200);

        TestHttp oldLogin = csrfClient();
        assertThat(oldLogin.sendWithCsrf("POST", "/api/auth/login", loginJson(handle, PASSWORD)).status()).isEqualTo(401);
        loggedIn(handle, NEW_PASSWORD);
    }

    @Test
    void deleteAccountRemovesUserAndEndsSession() {
        String handle = uniqueHandle("silinecek");
        TestHttp http = registered(handle, PASSWORD);
        TestHttp otherBrowser = loggedIn(handle, PASSWORD);

        TestHttp.Res wrong = http.sendWithCsrf("DELETE", "/api/me", "{\"password\":\"yanlis-sifre\"}");
        assertThat(wrong.status()).isEqualTo(401);
        assertThat(errorFields(wrong)).containsExactly("password");
        assertThat(users.existsByUsername(handle)).isTrue();

        TestHttp.Res noBody = http.sendWithCsrf("DELETE", "/api/me", null);
        assertThat(noBody.status()).isEqualTo(400);
        assertThat(users.existsByUsername(handle)).isTrue();

        TestHttp.Res ok = http.sendWithCsrf("DELETE", "/api/me", "{\"password\":\"" + PASSWORD + "\"}");
        assertThat(ok.status()).as(ok.body()).isEqualTo(204);
        assertThat(users.existsByUsername(handle)).isFalse();
        assertThat(http.cookie("JSESSIONID")).as("oturum çerezi silinir").isNull();
        assertThat(http.get("/api/auth/me").status()).isEqualTo(401);

        // Silme sonrası giriş 401, herkese açık profil 404
        TestHttp again = csrfClient();
        assertThat(again.sendWithCsrf("POST", "/api/auth/login", loginJson(handle, PASSWORD)).status()).isEqualTo(401);
        assertThat(again.get("/api/users/" + handle).status()).isEqualTo(404);

        // Başka tarayıcıdaki eski oturum da geçersiz
        assertThat(otherBrowser.get("/api/auth/me").status()).isEqualTo(401);
        assertThat(otherBrowser.get("/api/me/profile").status()).isEqualTo(401);

        // Rumuz yeniden alınırsa eski oturum yeni hesaba geçmez (kimlik id ile çözülür)
        registered(handle, "baska-biri-sifre");
        assertThat(otherBrowser.get("/api/auth/me").status()).isEqualTo(401);
        assertThat(otherBrowser.sendWithCsrf("PUT", "/api/me/profile",
                "{\"avatar\":\"ay\",\"checkinVisibility\":\"PUBLIC\",\"anonymousMode\":false}").status()).isEqualTo(401);
        assertThat(users.findByUsername(handle).orElseThrow().getAvatar()).isEqualTo("marti");
    }

    @Test
    void adminCannotDeleteSelf() {
        TestHttp admin = loggedIn(ADMIN_USER, ADMIN_PASS);
        TestHttp.Res res = admin.sendWithCsrf("DELETE", "/api/me", "{\"password\":\"" + ADMIN_PASS + "\"}");
        assertThat(res.status()).as(res.body()).isEqualTo(403);
        assertThat(res.json().get("message").asString()).isEqualTo("Yönetici hesabı silinemez");
        assertThat(users.existsByUsername(ADMIN_USER)).isTrue();
        assertThat(admin.get("/api/auth/me").status()).isEqualTo(200);
    }

    @Test
    void deletionPublishesEventForOtherModules() {
        String handle = uniqueHandle("olay");
        registered(handle, PASSWORD);
        AppUser u = users.findByUsername(handle).orElseThrow();

        assertThat(accounts.deleteAccount(u.getId(), PASSWORD)).isTrue();
        assertThat(applicationEvents.stream(UserDeletionEvent.class))
                .containsExactly(new UserDeletionEvent(u.getId(), handle));
        assertThat(users.findById(u.getId())).isEmpty();
    }
}
