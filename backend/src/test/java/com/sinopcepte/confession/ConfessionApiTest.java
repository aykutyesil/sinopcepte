package com.sinopcepte.confession;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import com.sinopcepte.TestHttp;
import com.sinopcepte.auth.UserTestSupport;

import tools.jackson.databind.JsonNode;

class ConfessionApiTest extends UserTestSupport {

    @Test
    void publicConfessionsListNeverLeakesAuthorHandle() {
        TestHttp anon = newClient();
        TestHttp.Res res = anon.get("/api/confessions");
        assertThat(res.status()).isEqualTo(200);
        JsonNode list = res.json();
        assertThat(list.isArray()).isTrue();
        assertThat(list.size()).isGreaterThanOrEqualTo(6);

        for (JsonNode c : list) {
            assertThat(c.has("authorHandle")).isFalse();
            assertThat(c.get("aliasName").asString()).matches(".+ #\\d+");
            assertThat(c.get("aliasAvatar").asString()).isNotEmpty();
            assertThat(c.get("body").asString()).isNotEmpty();
            assertThat(c.get("comments").isArray()).isTrue();
        }

        // Ham yanıtta gizli yazarların rumuzları sızmamalı
        assertThat(res.body()).doesNotContain("\"authorHandle\":\"selin\"");
    }

    @Test
    void createConfessionFlow() {
        String handle = uniqueHandle("itirafci");
        TestHttp user = registered(handle, PASSWORD);

        // Anonim deneme -> 401
        TestHttp.Res unauth = newClient().sendWithCsrf("POST", "/api/confessions", "{\"body\":\"Gizli sırrım\"}");
        assertThat(unauth.status()).isEqualTo(401);

        // Giriş yapmış kullanıcı itiraf paylaşır
        String body = "{\"body\":\"Dün akşam Kordon sahilinde yürürken sevgilimin çantasından kedi maması çıktı 🐱\",\"category\":\"gece\",\"customAliasTheme\":\"Kordon\"}";
        TestHttp.Res postRes = user.sendWithCsrf("POST", "/api/confessions", body);
        assertThat(postRes.status()).isEqualTo(200);
        JsonNode created = postRes.json();
        assertThat(created.get("aliasName").asString()).contains("Kordon");
        assertThat(created.get("isMine").asBoolean()).isTrue();
        String confessionId = created.get("id").asString();

        // Tepki ver (FIRE)
        TestHttp.Res reactRes = user.sendWithCsrf("POST", "/api/confessions/" + confessionId + "/react", "{\"type\":\"FIRE\"}");
        assertThat(reactRes.status()).isEqualTo(200);
        assertThat(reactRes.json().get("fireCount").asInt()).isEqualTo(1);
        assertThat(reactRes.json().get("myReactions").toString()).contains("FIRE");

        // Tekrar tıkla -> Toggle off
        TestHttp.Res reactOff = user.sendWithCsrf("POST", "/api/confessions/" + confessionId + "/react", "{\"type\":\"FIRE\"}");
        assertThat(reactOff.status()).isEqualTo(200);
        assertThat(reactOff.json().get("fireCount").asInt()).isEqualTo(0);

        // Yorum ekle
        String commentBody = "{\"body\":\"Kediler candır harika hareket!\",\"anonymous\":true}";
        TestHttp.Res cmtRes = user.sendWithCsrf("POST", "/api/confessions/" + confessionId + "/comments", commentBody);
        assertThat(cmtRes.status()).isEqualTo(200);
        JsonNode cmt = cmtRes.json();
        assertThat(cmt.get("body").asString()).isEqualTo("Kediler candır harika hareket!");
        assertThat(cmt.get("isAnonymous").asBoolean()).isTrue();
        assertThat(cmt.has("authorHandle")).isFalse();

        // Başka kullanıcı silemez (403)
        String otherHandle = uniqueHandle("diger");
        TestHttp other = registered(otherHandle, PASSWORD);
        TestHttp.Res delOther = other.sendWithCsrf("DELETE", "/api/confessions/" + confessionId, null);
        assertThat(delOther.status()).isEqualTo(403);

        // Sahibi silebilir (204)
        TestHttp.Res delOwner = user.sendWithCsrf("DELETE", "/api/confessions/" + confessionId, null);
        assertThat(delOwner.status()).isEqualTo(204);
    }
}
