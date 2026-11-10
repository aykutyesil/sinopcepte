package com.sinopcepte.user;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

import com.sinopcepte.auth.AppUser;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/**
 * {@code GET /api/users/{handle}} — herkese açık. <b>Asla e-posta, rol veya gizlilik ayarı içermez.</b>
 * Bu kayıt bilerek ayrı tutulur: {@link AppUser} veya {@link OwnProfile}'a alan eklemek buraya sızmaz.
 * Anahtar kümesi testle sabitlenmiştir ({@code PublicProfileTest}); null alanlar da yazılır.
 */
public record PublicProfile(
        String handle,
        String avatar,
        String bio,
        String instagram,
        OffsetDateTime createdAt,
        List<String> badges) {

    private static final JsonMapper MAPPER = JsonMapper.builder().build();

    public static PublicProfile of(AppUser u, ZoneId zone) {
        List<String> badges = List.of();
        String json = u.getBadgesJson();
        if (json != null && !json.isBlank() && !json.trim().equals("[]")) {
            try {
                JsonNode node = MAPPER.readTree(json);
                if (node.isArray()) {
                    List<String> list = new ArrayList<>();
                    node.forEach(item -> list.add(item.asString()));
                    badges = List.copyOf(list);
                }
            } catch (Exception ignored) {
                badges = List.of();
            }
        }
        return new PublicProfile(u.getUsername(), u.getAvatar(), u.getBio(), u.getInstagram(),
                u.getCreatedAt().atZoneSameInstant(zone).toOffsetDateTime(), badges);
    }
}
