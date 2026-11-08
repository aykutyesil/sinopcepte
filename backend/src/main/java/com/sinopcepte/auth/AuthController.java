package com.sinopcepte.auth;

import java.util.List;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sinopcepte.web.ApiError;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    public record LoginRequest(String username, String password) {
    }

    public record MeResponse(String username, List<String> roles) {

        static MeResponse of(Authentication auth) {
            List<String> roles = auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .filter(a -> a != null && a.startsWith("ROLE_"))
                    .map(a -> a.substring("ROLE_".length()))
                    .sorted()
                    .toList();
            return new MeResponse(auth.getName(), roles);
        }
    }

    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;
    private final SessionAuthenticationStrategy loginSessionStrategy;
    private final CookieCsrfTokenRepository csrfTokenRepository;
    private final SecurityContextHolderStrategy holder = SecurityContextHolder.getContextHolderStrategy();

    public AuthController(AuthenticationManager authenticationManager,
                          SecurityContextRepository securityContextRepository,
                          SessionAuthenticationStrategy loginSessionStrategy,
                          CookieCsrfTokenRepository csrfTokenRepository) {
        this.authenticationManager = authenticationManager;
        this.securityContextRepository = securityContextRepository;
        this.loginSessionStrategy = loginSessionStrategy;
        this.csrfTokenRepository = csrfTokenRepository;
    }

    /**
     * CSRF çerezini hazırlar. Token'lar ertelemeli yüklenir; burada {@code getToken()} çağrısı
     * çerezin ({@code XSRF-TOKEN}) yanıta yazılmasını sağlar.
     */
    @GetMapping("/csrf")
    public ResponseEntity<Void> csrf(CsrfToken token) {
        token.getToken();
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody(required = false) LoginRequest body,
                                   HttpServletRequest request, HttpServletResponse response) {
        if (body == null || body.username() == null || body.password() == null) {
            return unauthorized();
        }
        Authentication auth;
        try {
            auth = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(body.username(), body.password()));
        } catch (AuthenticationException e) {
            return unauthorized();
        }
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
        return ResponseEntity.ok(MeResponse.of(auth));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(Authentication auth, HttpServletRequest request, HttpServletResponse response) {
        SecurityContextLogoutHandler logout = new SecurityContextLogoutHandler();
        logout.setSecurityContextRepository(securityContextRepository);
        logout.logout(request, response, auth);
        new CsrfLogoutHandler(csrfTokenRepository).logout(request, response, auth);
        new CookieClearingLogoutHandler("JSESSIONID").logout(request, response, auth);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public MeResponse me(Authentication auth) {
        return MeResponse.of(auth);
    }

    private static ResponseEntity<ApiError> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiError.of(401, "Unauthorized", "Kullanıcı adı veya parola hatalı"));
    }
}
