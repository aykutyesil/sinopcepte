package com.sinopcepte.user;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.sinopcepte.TestHttp;
import com.sinopcepte.auth.AppUser;
import com.sinopcepte.auth.AppUserRepository;
import com.sinopcepte.auth.CheckinVisibility;
import com.sinopcepte.auth.UserTestSupport;

import tools.jackson.databind.JsonNode;

/** /api/me/profile ve /api/users/{handle}: kendi profilini düzenleme, herkese açık profil sızıntısızlığı. */
class ProfileTest extends UserTestSupport {

    @Autowired
    AppUserRepository users;

    private static String profileJson(String avatar, String bio, String instagram, String visibility, Object anon) {
        return "{\"avatar\":" + q(avatar) + ",\"bio\":" + q(bio) + ",\"instagram\":" + q(instagram)
                + ",\"checkinVisibility\":" + q(visibility) + ",\"anonymousMode\":" + anon + "}";
    }

    @Test
    void ownProfileHasContractShapeAndDefaults() {
        String handle = uniqueHandle("profil");
        TestHttp http = registered(handle, PASSWORD);
        TestHttp.Res res = http.get("/api/me/profile");
        assertThat(res.status()).isEqualTo(200);
        JsonNode p = res.json();
        assertThat(keys(p)).containsExactlyInAnyOrder("handle", "email", "avatar", "bio", "instagram",
                "checkinVisibility", "anonymousMode", "createdAt", "roles");
        assertThat(p.get("handle").asString()).isEqualTo(handle);
        assertThat(p.get("email").asString()).isEqualTo(handle + "@example.com");
        assertThat(p.get("avatar").asString()).isEqualTo("marti");
        assertThat(p.get("bio").isNull()).isTrue();
        assertThat(p.get("instagram").isNull()).isTrue();
        assertThat(p.get("checkinVisibility").asString()).isEqualTo("PUBLIC");
        assertThat(p.get("anonymousMode").asBoolean()).isFalse();
        assertThat(p.get("createdAt").asString()).matches("\\d{4}-\\d{2}-\\d{2}T.*\\+03:00");
        assertThat(p.get("roles").size()).isEqualTo(1);
        assertThat(p.get("roles").get(0).asString()).isEqualTo("USER");
    }

    @Test
    void profileEndpointsRequireSession() {
        TestHttp anon = csrfClient();
        assertThat(anon.get("/api/me/profile").status()).isEqualTo(401);
        assertThat(anon.sendWithCsrf("PUT", "/api/me/profile",
                profileJson("kale", null, null, "PUBLIC", false)).status()).isEqualTo(401);
        assertThat(anon.sendWithCsrf("PUT", "/api/me/password",
                "{\"currentPassword\":\"x\",\"newPassword\":\"yeni-sifre-123\"}").status()).isEqualTo(401);
        assertThat(anon.sendWithCsrf("DELETE", "/api/me", "{\"password\":\"x\"}").status()).isEqualTo(401);
    }

    @Test
    void updateOwnProfile() {
        String handle = uniqueHandle("duzenle");
        TestHttp http = registered(handle, PASSWORD);
        String bio160 = "🌊".repeat(160); // 160 karakter (code point), 320 UTF-16 birimi
        TestHttp.Res res = http.sendWithCsrf("PUT", "/api/me/profile",
                profileJson("fener", "  " + bio160 + "  ", " Sinop.Gezgini_57 ", "HIDDEN", true));
        assertThat(res.status()).as(res.body()).isEqualTo(200);
        JsonNode p = res.json();
        assertThat(p.get("avatar").asString()).isEqualTo("fener");
        assertThat(p.get("bio").asString()).isEqualTo(bio160);
        assertThat(p.get("instagram").asString()).isEqualTo("Sinop.Gezgini_57");
        assertThat(p.get("checkinVisibility").asString()).isEqualTo("HIDDEN");
        assertThat(p.get("anonymousMode").asBoolean()).isTrue();

        AppUser saved = users.findByUsername(handle).orElseThrow();
        assertThat(saved.getAvatar()).isEqualTo("fener");
        assertThat(saved.getCheckinVisibility()).isEqualTo(CheckinVisibility.HIDDEN);
        assertThat(saved.isAnonymousMode()).isTrue();
        assertThat(http.get("/api/auth/me").json().get("avatar").asString()).isEqualTo("fener");

        // Boş metin → temizlenir
        TestHttp.Res cleared = http.sendWithCsrf("PUT", "/api/me/profile", profileJson("kedi", "   ", "", "PUBLIC", false));
        assertThat(cleared.status()).as(cleared.body()).isEqualTo(200);
        assertThat(cleared.json().get("bio").isNull()).isTrue();
        assertThat(cleared.json().get("instagram").isNull()).isTrue();
        assertThat(users.findByUsername(handle).orElseThrow().getBio()).isNull();
    }

    record Bad(String json, String field) {
    }

    @Test
    void invalidProfileIs400AndChangesNothing() {
        String handle = uniqueHandle("hatali");
        TestHttp http = registered(handle, PASSWORD);
        for (Bad b : new Bad[] {
                new Bad(profileJson("ejderha", null, null, "PUBLIC", false), "avatar"),
                new Bad(profileJson("Marti", null, null, "PUBLIC", false), "avatar"),
                new Bad(profileJson(null, null, null, "PUBLIC", false), "avatar"),
                new Bad(profileJson("kale", "a".repeat(161), null, "PUBLIC", false), "bio"),
                new Bad(profileJson("kale", null, "https://instagram.com/ali", "PUBLIC", false), "instagram"),
                new Bad(profileJson("kale", null, "@ali", "PUBLIC", false), "instagram"),
                new Bad(profileJson("kale", null, "a".repeat(31), "PUBLIC", false), "instagram"),
                new Bad(profileJson("kale", null, null, "FRIENDS", false), "checkinVisibility"),
                new Bad(profileJson("kale", null, null, null, false), "checkinVisibility"),
                new Bad(profileJson("kale", null, null, "PUBLIC", null), "anonymousMode")}) {
            TestHttp.Res res = http.sendWithCsrf("PUT", "/api/me/profile", b.json());
            assertThat(res.status()).as("%s → %s", b, res.body()).isEqualTo(400);
            assertThat(errorFields(res)).as(b.json()).containsExactly(b.field());
        }
        AppUser saved = users.findByUsername(handle).orElseThrow();
        assertThat(saved.getAvatar()).isEqualTo("marti");
        assertThat(saved.getBio()).isNull();
        assertThat(saved.getInstagram()).isNull();
    }

    @Test
    void onlyOwnerCanEditProfile() {
        String a = uniqueHandle("sahip");
        String b = uniqueHandle("diger");
        registered(a, PASSWORD);
        TestHttp bHttp = registered(b, PASSWORD);

        // B'nin PUT'u yalnız B'yi değiştirir (hedef oturumdan çözülür, gövdedeki handle yok sayılır)
        TestHttp.Res res = bHttp.sendWithCsrf("PUT", "/api/me/profile",
                "{\"handle\":\"" + a + "\",\"avatar\":\"yunus\",\"bio\":\"B yazdı\",\"checkinVisibility\":\"HIDDEN\",\"anonymousMode\":true}");
        assertThat(res.status()).as(res.body()).isEqualTo(200);
        assertThat(res.json().get("handle").asString()).isEqualTo(b);

        // Başka kullanıcının profiline yazan bir uç yok
        for (String method : new String[] {"PUT", "POST", "PATCH", "DELETE"}) {
            TestHttp.Res other = bHttp.sendWithCsrf(method, "/api/users/" + a, profileJson("ay", "x", null, "PUBLIC", false));
            assertThat(other.status()).as("%s /api/users/%s", method, a).isGreaterThanOrEqualTo(400);
        }
        AppUser aSaved = users.findByUsername(a).orElseThrow();
        assertThat(aSaved.getAvatar()).isEqualTo("marti");
        assertThat(aSaved.getBio()).isNull();
        assertThat(aSaved.getCheckinVisibility()).isEqualTo(CheckinVisibility.PUBLIC);
        assertThat(users.findByUsername(b).orElseThrow().getAvatar()).isEqualTo("yunus");
    }

    @Test
    void publicProfileHasExactKeySetAndNoPrivateData() {
        String plain = uniqueHandle("acik");
        registered(plain, PASSWORD);
        String filled = uniqueHandle("dolu");
        TestHttp filledHttp = registered(filled, PASSWORD);
        assertThat(filledHttp.sendWithCsrf("PUT", "/api/me/profile",
                profileJson("hamsi", "Sinop'u seviyorum", "sinop_gezgin", "HIDDEN", true)).status()).isEqualTo(200);

        TestHttp anon = newClient(); // oturumsuz ziyaretçi
        for (String h : new String[] {plain, filled}) {
            TestHttp.Res res = anon.get("/api/users/" + h);
            assertThat(res.status()).as(res.body()).isEqualTo(200);
            JsonNode p = res.json();
            assertThat(keys(p)).as("PublicProfile anahtar kümesi")
                    .containsExactlyInAnyOrder("handle", "avatar", "bio", "instagram", "createdAt", "badges");
            assertThat(p.get("handle").asString()).isEqualTo(h);
            assertThat(p.get("badges").isArray()).isTrue();
            assertThat(p.get("badges").size()).isZero();
            assertThat(res.body()).doesNotContain("@example.com", "USER", "HIDDEN", "PUBLIC", "anonymous", "kvkk");
        }
        JsonNode f = anon.get("/api/users/" + filled).json();
        assertThat(f.get("avatar").asString()).isEqualTo("hamsi");
        assertThat(f.get("bio").asString()).isEqualTo("Sinop'u seviyorum");
        assertThat(f.get("instagram").asString()).isEqualTo("sinop_gezgin");
        JsonNode pl = anon.get("/api/users/" + plain).json();
        assertThat(pl.get("bio").isNull()).isTrue();
        assertThat(pl.get("instagram").isNull()).isTrue();

        // Büyük/küçük harf duyarsız; yoksa 404 (Türkçe mesaj); ADMIN hesabı herkese açık değil
        assertThat(anon.get("/api/users/" + plain.toUpperCase(java.util.Locale.ROOT)).status()).isEqualTo(200);
        TestHttp.Res missing = anon.get("/api/users/olmayan_kisi");
        assertThat(missing.status()).isEqualTo(404);
        assertThat(missing.json().get("message").asString()).isEqualTo("Kullanıcı bulunamadı");
        assertThat(anon.get("/api/users/" + ADMIN_USER).status()).isEqualTo(404);
    }
}
