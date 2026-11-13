package com.sinopcepte.auth;

import java.util.List;

/**
 * {@code Me}: {@code {username, roles, handle, avatar}}. {@code username} = {@code handle};
 * Faz 1 istemcileri için geriye dönük uyum amacıyla kalır. {@code roles} öneksiz, ör. {@code ["USER"]}.
 */
public record MeResponse(String username, List<String> roles, String handle, String avatar) {

    public static MeResponse of(AppUser u) {
        return new MeResponse(u.getUsername(), List.of(u.getRole().name()), u.getUsername(), u.getAvatar());
    }
}
