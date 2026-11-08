package com.sinopcepte.auth;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;

import javax.sql.DataSource;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.sinopcepte.IntegrationTestBase;

/**
 * Faz 1'de var olan bir admin satırı V10'dan sonra korunur. Uygulamanın şemasına dokunmadan, aynı
 * Postgres'te ayrı bir şemada V1–V2 uygulanır, Faz 1 tarzı (büyük harfli) admin eklenir, sonra V10.
 */
class V10MigrationTest extends IntegrationTestBase {

    private static final String SCHEMA = "v10_upgrade_check";

    @Autowired
    DataSource dataSource;

    @Autowired
    PasswordEncoder encoder;

    @Test
    void existingAdminRowSurvivesV10() {
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        jdbc.execute("drop schema if exists " + SCHEMA + " cascade");
        try {
            Flyway.configure().dataSource(dataSource).schemas(SCHEMA).locations("classpath:db/migration")
                    .target("2").load().migrate();
            String hash = encoder.encode("eski-admin-parola-1");
            jdbc.update("insert into " + SCHEMA + ".app_user (username, password_hash, role) values (?, ?, 'ADMIN')",
                    "Eski.Admin", hash);

            Flyway.configure().dataSource(dataSource).schemas(SCHEMA).locations("classpath:db/migration")
                    .load().migrate();

            Map<String, Object> row = jdbc.queryForMap("select * from " + SCHEMA + ".app_user");
            assertThat(row.get("username")).isEqualTo("eski.admin");
            assertThat(row.get("password_hash")).isEqualTo(hash);
            assertThat(row.get("role")).isEqualTo("ADMIN");
            assertThat(row.get("avatar")).isEqualTo("marti");
            assertThat(row.get("checkin_visibility")).isEqualTo("PUBLIC");
            assertThat(row.get("anonymous_mode")).isEqualTo(false);
            assertThat(row.get("email")).isNull();
            assertThat(row.get("kvkk_accepted_at")).isNull();
            assertThat(encoder.matches("eski-admin-parola-1", (String) row.get("password_hash"))).isTrue();
        } finally {
            jdbc.execute("drop schema if exists " + SCHEMA + " cascade");
        }
    }
}
