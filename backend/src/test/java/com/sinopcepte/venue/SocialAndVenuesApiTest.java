package com.sinopcepte.venue;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import com.sinopcepte.TestHttp;
import com.sinopcepte.auth.UserTestSupport;

import tools.jackson.databind.JsonNode;

class SocialAndVenuesApiTest extends UserTestSupport {

    @Test
    void publicVenuesEndpointReturnsProfiles() {
        TestHttp client = newClient();
        TestHttp.Res res = client.get("/api/venues");
        assertThat(res.status()).isEqualTo(200);
        JsonNode list = res.json();
        assertThat(list.isArray()).isTrue();
        assertThat(list.size()).isGreaterThanOrEqualTo(10);

        // Mathiday's Social kontrolü
        TestHttp.Res single = client.get("/api/venues/m-1");
        assertThat(single.status()).isEqualTo(200);
        JsonNode venue = single.json();
        assertThat(venue.get("title").asString()).isEqualTo("Mathiday's Social");
        assertThat(venue.get("slug").asString()).isEqualTo("mathidays-social");
        assertThat(venue.get("photos").isArray()).isTrue();
        assertThat(venue.get("menu").isArray()).isTrue();
    }

    @Test
    void checkinFlow() {
        String handle = uniqueHandle("chk");
        TestHttp user = registered(handle, PASSWORD);

        // Anonim liste
        TestHttp.Res listRes = newClient().get("/api/checkins");
        assertThat(listRes.status()).isEqualTo(200);

        // Check-in yap
        String body = "{\"itemId\":\"m-1\",\"displayName\":\"" + handle + "\",\"avatar\":\"fener\",\"note\":\"Sinop harika\",\"mood\":\"keyifli\"}";
        TestHttp.Res postRes = user.sendWithCsrf("POST", "/api/checkins", body);
        assertThat(postRes.status()).isEqualTo(200);
        JsonNode saved = postRes.json();
        assertThat(saved.get("handle").asString()).isEqualTo(handle);
        assertThat(saved.get("itemId").asString()).isEqualTo("m-1");

        // Mekan checkin listesinde görünmeli
        TestHttp.Res venueCheckins = newClient().get("/api/checkins/venue/m-1");
        assertThat(venueCheckins.status()).isEqualTo(200);
        assertThat(venueCheckins.body()).contains(handle);
    }

    @Test
    void okeye4Flow() {
        String hostHandle = uniqueHandle("host");
        TestHttp host = registered(hostHandle, PASSWORD);

        String applicantHandle = uniqueHandle("app");
        TestHttp applicant = registered(applicantHandle, PASSWORD);

        // 1. Host masa açar
        String lobbyBody = "{\"category\":\"okey\",\"title\":\"Akşam Okeye 4.\",\"venue\":\"Mathiday's Social\",\"district\":\"Merkez\",\"maxPlayers\":4,\"startTime\":\"20:00\",\"expiresIn\":\"2 saat sonra\",\"note\":\"Hadi gelin\"}";
        TestHttp.Res createRes = host.sendWithCsrf("POST", "/api/okeye4/lobbies", lobbyBody);
        assertThat(createRes.status()).isEqualTo(200);
        String lobbyId = createRes.json().get("id").asString();
        assertThat(lobbyId).isNotNull();

        // 2. Anonim lobileri listeler
        TestHttp.Res listRes = newClient().get("/api/okeye4/lobbies");
        assertThat(listRes.status()).isEqualTo(200);
        assertThat(listRes.body()).contains("Akşam Okeye 4.");

        // 3. Başvuran başvurur
        String applyBody = "{\"phone\":\"05551112233\",\"note\":\"10 dk ya oradayım\"}";
        TestHttp.Res applyRes = applicant.sendWithCsrf("POST", "/api/okeye4/lobbies/" + lobbyId + "/apply", applyBody);
        assertThat(applyRes.status()).isEqualTo(200);
        String reqId = applyRes.json().get("id").asString();

        // 4. Host başvuruyu onaylar
        String resolveBody = "{\"action\":\"APPROVE\"}";
        TestHttp.Res resolveRes = host.sendWithCsrf("POST", "/api/okeye4/lobbies/" + lobbyId + "/requests/" + reqId, resolveBody);
        assertThat(resolveRes.status()).isEqualTo(200);
        assertThat(resolveRes.json().get("status").asString()).isEqualTo("APPROVED");

        // 5. Başvuran bildirimini kontrol eder
        TestHttp.Res notifRes = applicant.get("/api/notifications");
        assertThat(notifRes.status()).isEqualTo(200);
        assertThat(notifRes.body()).contains("Masa Başvurun Onaylandı");
    }

    @Test
    void venueClaimAndAdminResolutionFlow() {
        String patronHandle = uniqueHandle("patron");
        TestHttp patron = registered(patronHandle, PASSWORD);

        // 1. Mekan sahiplik talebi gönder
        String claimBody = "{\"phone\":\"05445721905\",\"note\":\"Bu mekanın sahibiyim\"}";
        TestHttp.Res claimRes = patron.sendWithCsrf("POST", "/api/venues/m-2/claims", claimBody);
        assertThat(claimRes.status()).isEqualTo(200);
        String claimId = claimRes.json().get("id").asString();
        assertThat(claimId).isNotNull();

        // 2. Admin girişi yap
        TestHttp admin = csrfClient();
        TestHttp.Res login = admin.sendWithCsrf("POST", "/api/auth/login", loginJson(ADMIN_USER, ADMIN_PASS));
        assertThat(login.status()).isEqualTo(200);

        // 3. Admin talepleri listeler
        TestHttp.Res claimsList = admin.get("/api/admin/venue-claims");
        assertThat(claimsList.status()).isEqualTo(200);
        assertThat(claimsList.body()).contains(patronHandle);

        // 4. Admin talebi onaylar
        TestHttp.Res resolve = admin.sendWithCsrf("POST", "/api/admin/venue-claims/" + claimId + "/resolve", "{\"action\":\"APPROVE\"}");
        assertThat(resolve.status()).isEqualTo(200);
        assertThat(resolve.json().get("status").asString()).isEqualTo("APPROVED");

        // 5. Mekanın sahibi artık patronHandle olmalı
        JsonNode updatedVenue = newClient().get("/api/venues/m-2").json();
        assertThat(updatedVenue.get("ownerHandle").asString()).isEqualTo(patronHandle);

        // 6. Patron profilinde rozet görünmeli
        JsonNode profile = newClient().get("/api/users/" + patronHandle).json();
        assertThat(profile.get("badges").toString()).contains("👑 Mekan Sahibi (Patron)");

        // 7. Patron mekanını düzenleyebilir
        String updateBody = "{\"desc\":\"Yenilenen menümüzle hizmetinizdeyiz!\",\"phone\":\"03682611905\",\"wa\":\"905445721905\",\"rating\":\"4.9\",\"mapUrl\":\"https://maps.google.com\",\"photos\":[\"/img1.jpg\"],\"menu\":[{\"category\":\"Kahve\",\"name\":\"Sinop Dibek\",\"price\":\"85 ₺\"}]}";
        TestHttp.Res updateRes = patron.sendWithCsrf("PUT", "/api/venues/m-2", updateBody);
        assertThat(updateRes.status()).isEqualTo(200);
        assertThat(updateRes.json().get("rating").asString()).isEqualTo("4.9");
    }
}
