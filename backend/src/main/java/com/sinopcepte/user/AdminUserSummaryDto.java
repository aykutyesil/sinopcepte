package com.sinopcepte.user;

import java.time.OffsetDateTime;
import java.util.List;
import com.sinopcepte.auth.CheckinVisibility;
import com.sinopcepte.auth.Role;

public record AdminUserSummaryDto(
        Long id,
        String username,
        String email,
        String phone,
        Role role,
        String avatar,
        String bio,
        String instagram,
        String badgesJson,
        CheckinVisibility checkinVisibility,
        boolean anonymousMode,
        OffsetDateTime createdAt,
        int checkinCount,
        int lobbyCount,
        int confessionCount,
        List<String> ownedVenues
) {}
