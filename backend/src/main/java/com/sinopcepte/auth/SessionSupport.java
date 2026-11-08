package com.sinopcepte.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.web.authentication.logout.CookieClearingLogoutHandler;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfLogoutHandler;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Component;

/**
 * Oturum açma/kapama mekaniği tek yerde: giriş ve kayıt aynı yolu kullanır
 * (oturum kimliği değişir + CSRF token'ı yenilenir); çıkış ve hesap silme de aynı yolu.
 */
@Component
public class SessionSupport {

    private final SecurityContextRepository securityContextRepository;
    private final SessionAuthenticationStrategy loginSessionStrategy;
    private final CookieCsrfTokenRepository csrfTokenRepository;
    private final SecurityContextHolderStrategy holder = SecurityContextHolder.getContextHolderStrategy();

    public SessionSupport(SecurityContextRepository securityContextRepository,
                          SessionAuthenticationStrategy loginSessionStrategy,
                          CookieCsrfTokenRepository csrfTokenRepository) {
        this.securityContextRepository = securityContextRepository;
        this.loginSessionStrategy = loginSessionStrategy;
        this.csrfTokenRepository = csrfTokenRepository;
    }

    /** Kimliği doğrulanmış kullanıcı için oturum açar. Yanıta yeni JSESSIONID ve yeni XSRF-TOKEN yazılır. */
    public void establish(Authentication auth, HttpServletRequest request, HttpServletResponse response) {
        // Oturum sabitleme koruması (session id değişir) + CSRF token'ını yenile.
        loginSessionStrategy.onAuthentication(auth, request, response);

        SecurityContext context = holder.createEmptyContext();
        context.setAuthentication(auth);
        holder.setContext(context);
        securityContextRepository.saveContext(context, request, response);

        // Yenilenen token'ı hemen yükle ki yeni XSRF-TOKEN çerezi bu yanıtla gitsin.
        Object fresh = request.getAttribute(CsrfToken.class.getName());
        if (fresh instanceof CsrfToken t) {
            t.getToken();
        }
    }

    /** Oturumu düşürür; JSESSIONID ve XSRF-TOKEN silinir. */
    public void terminate(Authentication auth, HttpServletRequest request, HttpServletResponse response) {
        SecurityContextLogoutHandler logout = new SecurityContextLogoutHandler();
        logout.setSecurityContextRepository(securityContextRepository);
        logout.logout(request, response, auth);
        new CsrfLogoutHandler(csrfTokenRepository).logout(request, response, auth);
        new CookieClearingLogoutHandler("JSESSIONID").logout(request, response, auth);
    }
}
