package com.sinopcepte.user;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;

import com.sinopcepte.auth.AppUser;

/**
 * {@code GET /api/users/{handle}} — herkese açık. <b>Asla e-posta, rol veya gizlilik ayarı içermez.</b>
 * Bu kayıt bilerek ayrı tutulur: {@link AppUser} veya {@link OwnProfile}'a alan eklemek buraya sızmaz.
 * Anahtar kümesi testle sabitlenmiştir ({@code PublicProfileTest}); null alanlar da yazılır.
 *
 * @param badges N8 (Mayor vb.) dolduracak; şimdilik hep boş dizi
 */
public record PublicProfile(
        String handle,
        String avatar,
        String bio,
        String instagram,
        OffsetDateTime createdAt,
        List<String> badges) {

    public static PublicProfile of(AppUser u, ZoneId zone) {
        return new PublicProfile(u.getUsername(), u.getAvatar(), u.getBio(), u.getInstagram(),
                u.getCreatedAt().atZoneSameInstant(zone).toOffsetDateTime(), List.of());
    }
}
