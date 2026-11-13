package com.sinopcepte.user;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;

import com.sinopcepte.auth.AppUser;

/** {@code GET/PUT /api/me/profile} — yalnız oturum sahibine döner. Null alanlar {@code null} olarak yazılır. */
public record OwnProfile(
        String handle,
        String email,
        String avatar,
        String bio,
        String instagram,
        String checkinVisibility,
        boolean anonymousMode,
        OffsetDateTime createdAt,
        List<String> roles) {

    public static OwnProfile of(AppUser u, ZoneId zone) {
        return new OwnProfile(u.getUsername(), u.getEmail(), u.getAvatar(), u.getBio(), u.getInstagram(),
                u.getCheckinVisibility().name(), u.isAnonymousMode(),
                u.getCreatedAt().atZoneSameInstant(zone).toOffsetDateTime(),
                List.of(u.getRole().name()));
    }
}
