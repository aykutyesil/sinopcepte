package db.migration;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/**
 * Seed verisini {@code classpath:seed/items.json} ve {@code seed/events.json} dosyalarından yükler.
 * Veri elle yeniden yazılmaz; JSON dosyaları N1 düğümünde legacy HTML'den çıkarılıp doğrulanmıştır.
 *
 * <p>Flyway bu migration'ı yalnız bir kez çalıştırır. Ek güvence olarak {@code on conflict do nothing}
 * kullanılır; böylece tekrar çalıştırılsa bile mevcut kayıtlar çoğaltılmaz veya ezilmez.
 * Admin tüm kayıtları silse bile seed geri gelmez (boş tabloya bakan bir runner'ın aksine).
 */
public class V2__load_seed extends BaseJavaMigration {

    private static final JsonMapper JSON = JsonMapper.builder().build();

    @Override
    public void migrate(Context context) throws Exception {
        Connection conn = context.getConnection();
        loadItems(conn);
        loadEvents(conn);
    }

    private void loadItems(Connection conn) throws SQLException, IOException {
        JsonNode items = read("/seed/items.json");
        String sql = """
                insert into item (id, category, title, badge, location, description, phone, wa, rating, map_url, sort_order)
                values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                on conflict (id) do nothing
                """;
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            int order = 0;
            for (JsonNode n : items) {
                ps.setString(1, required(n, "id"));
                ps.setString(2, required(n, "category"));
                ps.setString(3, required(n, "title"));
                ps.setString(4, text(n, "badge"));
                ps.setString(5, text(n, "location"));
                ps.setString(6, text(n, "desc"));
                ps.setString(7, text(n, "phone"));
                ps.setString(8, text(n, "wa"));
                ps.setString(9, text(n, "rating"));
                ps.setString(10, text(n, "mapUrl"));
                ps.setInt(11, order++);
                ps.addBatch();
            }
            ps.executeBatch();
        }
    }

    private void loadEvents(Connection conn) throws SQLException, IOException {
        JsonNode events = read("/seed/events.json");
        String sql = """
                insert into live_event (id, title, venue, location, date_label, badge, description, wa, sort_order)
                values (?, ?, ?, ?, ?, ?, ?, ?, ?)
                on conflict (id) do nothing
                """;
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            int order = 0;
            for (JsonNode n : events) {
                ps.setString(1, required(n, "id"));
                ps.setString(2, required(n, "title"));
                ps.setString(3, text(n, "venue"));
                ps.setString(4, text(n, "location"));
                ps.setString(5, text(n, "date"));
                ps.setString(6, text(n, "badge"));
                ps.setString(7, text(n, "desc"));
                ps.setString(8, text(n, "wa"));
                ps.setInt(9, order++);
                ps.addBatch();
            }
            ps.executeBatch();
        }
    }

    private static JsonNode read(String path) throws IOException {
        try (InputStream in = V2__load_seed.class.getResourceAsStream(path)) {
            if (in == null) {
                throw new IllegalStateException("Seed dosyası bulunamadı: " + path);
            }
            JsonNode root = JSON.readTree(in);
            if (!root.isArray()) {
                throw new IllegalStateException("Seed dosyası bir JSON dizisi olmalı: " + path);
            }
            return root;
        }
    }

    private static String text(JsonNode n, String field) {
        JsonNode v = n.get(field);
        return (v == null || v.isNull()) ? null : v.asString();
    }

    private static String required(JsonNode n, String field) {
        String v = text(n, field);
        if (v == null || v.isBlank()) {
            throw new IllegalStateException("Seed kaydında zorunlu alan eksik: " + field + " -> " + n);
        }
        return v;
    }
}
