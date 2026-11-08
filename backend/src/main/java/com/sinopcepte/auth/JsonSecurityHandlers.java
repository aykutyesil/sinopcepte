package com.sinopcepte.auth;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationTrustResolver;
import org.springframework.security.authentication.AuthenticationTrustResolverImpl;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.csrf.CsrfException;

import com.sinopcepte.web.ApiError;

/**
 * JSON 401/403 yanıtları. Asla yönlendirme veya giriş sayfası dönmez.
 *
 * <p>CsrfFilter yetkilendirmeden önce çalışır; oturumu olmayan biri CSRF token'sız POST attığında
 * normalde 403 alırdı. Oturumsuz istemci için asıl sorun kimlik olduğundan bu durumda 401 dönülür.
 * İstisna: {@code /api/auth/login} — orada CSRF eksikse 403 kalır (giriş CSRF'sine karşı koruma).
 */
public final class JsonSecurityHandlers implements AuthenticationEntryPoint, AccessDeniedHandler {

    private static final String LOGIN_PATH = "/api/auth/login";

    private final AuthenticationTrustResolver trust = new AuthenticationTrustResolverImpl();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException e)
            throws IOException {
        write(response, ApiError.of(401, "Unauthorized"));
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException e)
            throws IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean anonymous = auth == null || trust.isAnonymous(auth) || !auth.isAuthenticated();
        if (anonymous && e instanceof CsrfException && !LOGIN_PATH.equals(pathOf(request))) {
            write(response, ApiError.of(401, "Unauthorized"));
            return;
        }
        String msg = e instanceof CsrfException ? "CSRF token eksik veya geçersiz" : null;
        write(response, ApiError.of(403, "Forbidden", msg));
    }

    static void write(HttpServletResponse response, ApiError body) throws IOException {
        response.setStatus(body.status());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write(body.toJson());
    }

    private static String pathOf(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String ctx = request.getContextPath();
        return ctx != null && !ctx.isEmpty() && uri.startsWith(ctx) ? uri.substring(ctx.length()) : uri;
    }
}
