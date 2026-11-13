package com.sinopcepte.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
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

    /** {@code username}: rumuz veya e-posta (büyük/küçük harf duyarsız). */
    public record LoginRequest(String username, String password) {
    }

    public record RegisterRequest(String handle, String email, String password, Boolean kvkkAccepted) {
    }

    public record ForgotPasswordRequest(String emailOrHandle) {
    }

    public record ResetPasswordRequest(String token, String newPassword) {
    }

    private final AuthenticationManager authenticationManager;
    private final SessionSupport sessions;
    private final CurrentUser currentUser;
    private final UserAccountService accounts;
    private final AuthRateLimits rateLimits;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthenticationManager authenticationManager, SessionSupport sessions,
                          CurrentUser currentUser, UserAccountService accounts, AuthRateLimits rateLimits,
                          PasswordResetService passwordResetService) {
        this.authenticationManager = authenticationManager;
        this.sessions = sessions;
        this.currentUser = currentUser;
        this.accounts = accounts;
        this.rateLimits = rateLimits;
        this.passwordResetService = passwordResetService;
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

    /**
     * Hız sınırı parola denetiminden <b>önce</b> uygulanır: sınır dolunca doğru parola da 429 alır.
     * Yalnız başarısız denemeler sayılır.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody(required = false) LoginRequest body,
                                   HttpServletRequest request, HttpServletResponse response) {
        rateLimits.checkLogin(request);
        if (body == null || body.username() == null || body.password() == null) {
            rateLimits.recordLoginFailure(request);
            return unauthorized();
        }
        Authentication auth;
        try {
            auth = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(body.username(), body.password()));
        } catch (AuthenticationException e) {
            rateLimits.recordLoginFailure(request);
            return unauthorized();
        }
        sessions.establish(auth, request, response);
        return ResponseEntity.ok(MeResponse.of(currentUser.require(auth)));
    }

    /**
     * Kayıt + otomatik giriş (giriş ile aynı oturum/CSRF yenileme). Sayaç: 400 doğrulama hataları
     * sayılmaz; geçerli gövdeli her deneme (201 veya 409) sayılır.
     */
    @PostMapping("/register")
    public ResponseEntity<MeResponse> register(@RequestBody(required = false) RegisterRequest body,
                                               HttpServletRequest request, HttpServletResponse response) {
        rateLimits.checkRegister(request);
        RegisterRequest b = body == null ? new RegisterRequest(null, null, null, null) : body;
        UserAccountService.Registration valid =
                accounts.validateRegistration(b.handle(), b.email(), b.password(), b.kvkkAccepted());
        rateLimits.recordRegister(request);
        AppUser created = accounts.create(valid);

        AppUserPrincipal principal = AppUserPrincipal.of(created);
        principal.eraseCredentials();
        Authentication auth = UsernamePasswordAuthenticationToken.authenticated(
                principal, null, principal.getAuthorities());
        sessions.establish(auth, request, response);
        return ResponseEntity.status(HttpStatus.CREATED).body(MeResponse.of(created));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(Authentication auth, HttpServletRequest request, HttpServletResponse response) {
        sessions.terminate(auth, request, response);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public MeResponse me(Authentication auth) {
        return MeResponse.of(currentUser.require(auth));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<PasswordResetService.ForgotPasswordResponse> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        return ResponseEntity.ok(passwordResetService.requestReset(req.emailOrHandle()));
    }

    @GetMapping("/validate-reset-token")
    public ResponseEntity<Boolean> validateResetToken(@org.springframework.web.bind.annotation.RequestParam("token") String token) {
        return ResponseEntity.ok(passwordResetService.validateToken(token));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestBody ResetPasswordRequest req) {
        passwordResetService.resetPassword(req.token(), req.newPassword());
        return ResponseEntity.noContent().build();
    }

    private static ResponseEntity<ApiError> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiError.of(401, "Unauthorized", "Kullanıcı adı veya parola hatalı"));
    }
}
