package com.sinopcepte.catalog;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.sinopcepte.IntegrationTestBase;
import com.sinopcepte.TestHttp;
import com.sinopcepte.pharmacy.PharmacyDutyRepository;

import tools.jackson.databind.JsonNode;

/** Herkese açık uçlar seed dosyalarını birebir (id kümesi, sıra ve alanlar) döndürmeli. */
class CatalogApiTest extends IntegrationTestBase {

    @Autowired
    PharmacyDutyRepository pharmacyRepo;

    @BeforeEach
    void noPharmacyRecord() {
        pharmacyRepo.deleteAll();
    }

    private static List<String> ids(JsonNode array) {
        List<String> out = new ArrayList<>();
        array.forEach(n -> out.add(n.get("id").asString()));
        return out;
    }

    @Test
    void itemsMatchSeedIdsAndOrder() throws Exception {
        JsonNode seed = readSeed("items.json");
        TestHttp.Res res = newClient().get("/api/items");

        assertThat(res.status()).isEqualTo(200);
        JsonNode body = res.json();
        assertThat(seed.size()).isEqualTo(15);
        assertThat(ids(body)).containsExactlyElementsOf(ids(seed));
    }

    @Test
    void itemsEqualSeedFieldByFieldWhenNoPharmacyRecord() throws Exception {
        JsonNode seed = readSeed("items.json");
        JsonNode body = newClient().get("/api/items").json();
        assertThat(body.size()).isEqualTo(seed.size());
        for (int i = 0; i < seed.size(); i++) {
            assertThat(body.get(i)).as("kart %s", seed.get(i).get("id").asString()).isEqualTo(seed.get(i));
        }
    }

    @Test
    void eventsMatchSeedIdsOrderAndFields() throws Exception {
        JsonNode seed = readSeed("events.json");
        TestHttp.Res res = newClient().get("/api/events");

        assertThat(res.status()).isEqualTo(200);
        JsonNode body = res.json();
        assertThat(seed.size()).isEqualTo(4);
        assertThat(ids(body)).containsExactlyElementsOf(ids(seed));
        for (int i = 0; i < seed.size(); i++) {
            assertThat(body.get(i)).isEqualTo(seed.get(i));
        }
    }

    @Test
    void categoryFilterKeepsSeedOrder() throws Exception {
        JsonNode seed = readSeed("items.json");
        for (String cat : Categories.ALL) {
            List<String> expected = new ArrayList<>();
            seed.forEach(n -> {
                if (n.get("category").asString().equals(cat)) {
                    expected.add(n.get("id").asString());
                }
            });
            JsonNode body = newClient().get("/api/items?category=" + cat).json();
            assertThat(expected).as("seed'de %s var", cat).isNotEmpty();
            assertThat(ids(body)).as("kategori %s", cat).containsExactlyElementsOf(expected);
        }
    }

    @Test
    void unknownCategoryIs400() {
        TestHttp.Res res = newClient().get("/api/items?category=bar");
        assertThat(res.status()).isEqualTo(400);
        assertThat(res.json().get("status").asInt()).isEqualTo(400);
    }

    @Test
    void pharmacyTodayIs404WhenNeverFetched() {
        TestHttp.Res res = newClient().get("/api/pharmacy/today");
        assertThat(res.status()).isEqualTo(404);
    }
}
