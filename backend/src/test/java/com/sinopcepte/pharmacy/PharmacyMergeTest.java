package com.sinopcepte.pharmacy;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.sinopcepte.IntegrationTestBase;
import com.sinopcepte.TestHttp;

import tools.jackson.databind.JsonNode;

/** Kayıtlı eczane varken e-1 kartı onunla birleştirilmeli; diğer kartlar değişmemeli. */
class PharmacyMergeTest extends IntegrationTestBase {

    @Autowired
    PharmacyService pharmacyService;

    @Autowired
    PharmacyDutyRepository pharmacyRepo;

    @BeforeEach
    @AfterEach
    void clean() {
        pharmacyRepo.deleteAll();
    }

    /** Seed'dekinden bilerek farklı değerler: birleştirme gerçekten olmazsa test kalır. */
    private static final ParsedPharmacy SAMPLE = new ParsedPharmacy(
            "Deniz Eczanesi",
            "Camikebir Mahallesi, Atatürk Caddesi No:5 Merkez / Sinop",
            "0 (368) 111-22-33",
            "03681112233",
            "https://www.google.com/maps?daddr=42.0300000,35.1500000",
            42.03, 35.15);

    @Test
    void e1IsMergedWithLatestPharmacy() throws Exception {
        pharmacyService.save(SAMPLE);

        JsonNode body = newClient().get("/api/items").json();
        JsonNode seed = readSeed("items.json");

        JsonNode e1 = null;
        for (int i = 0; i < body.size(); i++) {
            JsonNode n = body.get(i);
            assertThat(n.get("id").asString()).isEqualTo(seed.get(i).get("id").asString());
            if (n.get("id").asString().equals("e-1")) {
                e1 = n;
            } else {
                assertThat(n).as("diğer kartlar değişmez").isEqualTo(seed.get(i));
            }
        }
        assertThat(e1).isNotNull();
        assertThat(e1.get("title").asString()).isEqualTo("Deniz Eczanesi (Sinop Merkez Nöbetçi)");
        assertThat(e1.get("location").asString()).isEqualTo("📍 Camikebir Mahallesi, Atatürk Caddesi No:5 Merkez / Sinop");
        assertThat(e1.get("phone").asString()).isEqualTo("03681112233");
        assertThat(e1.get("wa").asString()).isEqualTo("903681112233");
        assertThat(e1.get("mapUrl").asString()).isEqualTo("https://www.google.com/maps?daddr=42.0300000,35.1500000");
        assertThat(e1.get("category").asString()).isEqualTo("eczane");
        assertThat(e1.get("badge").asString()).isEqualTo("💊 Bugün Nöbetçi • Sabaha Kadar Açık");
    }

    @Test
    void todayEndpointReturnsLatestRecord() {
        pharmacyService.save(SAMPLE);

        TestHttp.Res res = newClient().get("/api/pharmacy/today");
        assertThat(res.status()).isEqualTo(200);
        JsonNode j = res.json();
        assertThat(j.get("name").asString()).isEqualTo("Deniz Eczanesi");
        assertThat(j.get("address").asString()).isEqualTo("Camikebir Mahallesi, Atatürk Caddesi No:5 Merkez / Sinop");
        assertThat(j.get("phone").asString()).isEqualTo("0 (368) 111-22-33");
        assertThat(j.get("phoneFormatted").asString()).isEqualTo("03681112233");
        assertThat(j.get("mapUrl").asString()).isEqualTo("https://www.google.com/maps?daddr=42.0300000,35.1500000");
        assertThat(j.get("lat").isNumber()).isTrue();
        assertThat(j.get("lat").asDouble()).isEqualTo(42.03);
        assertThat(j.get("lng").asDouble()).isEqualTo(35.15);
        assertThat(j.get("updatedAt").asString()).matches("\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.*\\+03:00");
    }

    @Test
    void savingTwiceOnSameDayUpdatesSingleRecord() {
        pharmacyService.save(SAMPLE);
        pharmacyService.save(new ParsedPharmacy("Elif Eczanesi", "Adres", "0 (368) 261-72-36", "03682617236",
                null, null, null));
        assertThat(pharmacyRepo.count()).isEqualTo(1);
        assertThat(newClient().get("/api/pharmacy/today").json().get("name").asString()).isEqualTo("Elif Eczanesi");
    }
}
