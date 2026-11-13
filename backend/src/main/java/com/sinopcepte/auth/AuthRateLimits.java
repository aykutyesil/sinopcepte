package com.sinopcepte.auth;

import java.time.Clock;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Component;

/**
 * Giriş ve kayıt için IP başına sınırlar.
 *
 * <p>IP = {@code request.getRemoteAddr()}. {@code server.forward-headers-strategy=native} ile bu değeri Tomcat
 * RemoteIpValve belirler: {@code X-Forwarded-For} yalnız iç vekilden gelirse dikkate alınır ve zincir sağdan
 * okunur; ilk iç olmayan adres istemcidir. Kenardaki nginx başlığı {@code $remote_addr} ile ezer
 * ({@code nginx/nginx.conf}). Next.js rewrite başlığı olduğu gibi iletir, gerçek IP eklemez (ölçüldü).
 */
@Component
public class AuthRateLimits {

    private final RateLimiter loginFailures;
    private final RateLimiter registrations;

    public AuthRateLimits(RateLimitProperties props, Clock clock) {
        this.loginFailures = new RateLimiter(props.login().max(), props.login().window(), clock);
        this.registrations = new RateLimiter(props.register().max(), props.register().window(), clock);
    }

    public static String clientIp(HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        return ip == null ? "?" : ip;
    }

    /** Başarısız giriş (ve yanlış mevcut şifre) sınırı dolmuşsa 429. */
    public void checkLogin(HttpServletRequest request) {
        loginFailures.check(clientIp(request));
    }

    public void recordLoginFailure(HttpServletRequest request) {
        loginFailures.record(clientIp(request));
    }

    public void checkRegister(HttpServletRequest request) {
        registrations.check(clientIp(request));
    }

    public void recordRegister(HttpServletRequest request) {
        registrations.record(clientIp(request));
    }
}
