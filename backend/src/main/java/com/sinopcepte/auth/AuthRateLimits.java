package com.sinopcepte.auth;

import java.time.Clock;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Component;

/**
 * Giriş ve kayıt için IP başına sınırlar.
 *
 * <p>IP = {@code request.getRemoteAddr()}. {@code server.forward-headers-strategy=framework} olduğundan
 * bu değer {@code X-Forwarded-For}'un <b>en soldaki</b> girdisidir. Bu yüzden önündeki vekil
 * (nginx vb.) başlığı istemciden geleni eklemeden, kendisi <b>yazmalıdır</b>
 * ({@code proxy_set_header X-Forwarded-For $remote_addr;}); aksi halde istemci sahte IP ile sınırı aşar.
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
