package com.sinopcepte;

import java.io.InputStream;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/**
 * Tüm entegrasyon testleri aynı yapılandırmayı paylaşır → tek Spring context, tek Postgres konteyneri.
 * Gerçek HTTP (RANDOM_PORT) kullanılır; CSRF ve çerezler tarayıcıdaki gibi uçtan uca sınanır.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("test")
public abstract class IntegrationTestBase {

    public static final String ADMIN_USER = "test-admin";
    public static final String ADMIN_PASS = "test-admin-parola-123";

    protected static final JsonMapper JSON = JsonMapper.builder().build();

    @LocalServerPort
    protected int port;

    protected TestHttp newClient() {
        return new TestHttp("http://localhost:" + port);
    }

    protected static JsonNode readSeed(String name) throws Exception {
        try (InputStream in = IntegrationTestBase.class.getResourceAsStream("/seed/" + name)) {
            if (in == null) {
                throw new IllegalStateException("seed bulunamadı: " + name);
            }
            return JSON.readTree(in);
        }
    }
}
