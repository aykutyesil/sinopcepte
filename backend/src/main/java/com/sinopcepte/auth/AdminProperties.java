package com.sinopcepte.auth;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * {@code app.admin.*} — ADMIN_USERNAME / ADMIN_PASSWORD ortam değişkenlerinden gelir.
 * Kodda varsayılan parola yoktur.
 */
@ConfigurationProperties(prefix = "app.admin")
public record AdminProperties(String username, String password) {
}
