package com.sinopcepte.auth;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * {@code app.rate-limit.*} — IP başına kaba kuvvet sınırları.
 *
 * @param login    pencere içinde izin verilen <b>başarısız</b> giriş denemesi
 * @param register pencere içinde izin verilen kayıt denemesi (400 doğrulama hataları sayılmaz)
 */
@ConfigurationProperties(prefix = "app.rate-limit")
public record RateLimitProperties(Limit login, Limit register) {

    public record Limit(int max, Duration window) {
    }

    public RateLimitProperties {
        if (login == null) {
            login = new Limit(10, Duration.ofMinutes(10));
        }
        if (register == null) {
            register = new Limit(5, Duration.ofHours(1));
        }
    }
}
