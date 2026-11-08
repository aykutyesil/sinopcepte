package com.sinopcepte.user;

import java.time.Clock;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sinopcepte.auth.AppUser;
import com.sinopcepte.auth.AuthRateLimits;
import com.sinopcepte.auth.CurrentUser;
import com.sinopcepte.auth.SessionSupport;
import com.sinopcepte.auth.UserAccountService;
import com.sinopcepte.web.UnauthorizedException;

/**
 * {@code /api/me/**} — yalnız oturum sahibinin kendi hesabı. Hedef kullanıcı yoldan/gövdeden alınmaz,
 * her zaman oturumdan ({@link CurrentUser}, id ile) çözülür; bu yüzden başkasını düzenlemek mümkün değildir.
 */
@RestController
@RequestMapping("/api/me")
public class MeController {

    public record PasswordChange(String currentPassword, String newPassword) {
    }

    public record DeleteAccount(String password) {
    }

    private final CurrentUser currentUser;
    private final UserAccountService accounts;
    private final AuthRateLimits rateLimits;
    private final SessionSupport sessions;
    private final Clock clock;

    public MeController(CurrentUser currentUser, UserAccountService accounts, AuthRateLimits rateLimits,
                        SessionSupport sessions, Clock clock) {
        this.currentUser = currentUser;
        this.accounts = accounts;
        this.rateLimits = rateLimits;
        this.sessions = sessions;
        this.clock = clock;
    }

    @GetMapping("/profile")
    public OwnProfile profile(Authentication auth) {
        return OwnProfile.of(currentUser.require(auth), clock.getZone());
    }

    @PutMapping("/profile")
    public OwnProfile updateProfile(Authentication auth,
                                    @RequestBody(required = false) UserAccountService.ProfileUpdate body) {
        AppUser me = currentUser.require(auth);
        UserAccountService.ProfileUpdate b = body == null
                ? new UserAccountService.ProfileUpdate(null, null, null, null, null) : body;
        return OwnProfile.of(accounts.updateProfile(me.getId(), b), clock.getZone());
    }

    /** 204; yanlış mevcut şifre → 401 ({@code currentPassword}) ve giriş hız sınırına sayılır. */
    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(Authentication auth, @RequestBody(required = false) PasswordChange body,
                                               HttpServletRequest request) {
        AppUser me = currentUser.require(auth);
        rateLimits.checkLogin(request);
        PasswordChange b = body == null ? new PasswordChange(null, null) : body;
        if (!accounts.changePassword(me.getId(), b.currentPassword(), b.newPassword())) {
            rateLimits.recordLoginFailure(request);
            throw new UnauthorizedException("currentPassword", "Mevcut şifre hatalı");
        }
        // Şifre değişince oturum kimliği de değişir (çalınmış eski kimlik geçersizleşir).
        request.changeSessionId();
        return ResponseEntity.noContent().build();
    }

    /** 204 ve oturum kapanır. ADMIN → 403. Yanlış şifre → 401 ({@code password}). */
    @DeleteMapping
    public ResponseEntity<Void> delete(Authentication auth, @RequestBody(required = false) DeleteAccount body,
                                       HttpServletRequest request, HttpServletResponse response) {
        AppUser me = currentUser.require(auth);
        rateLimits.checkLogin(request);
        if (!accounts.deleteAccount(me.getId(), body == null ? null : body.password())) {
            rateLimits.recordLoginFailure(request);
            throw new UnauthorizedException("password", "Şifre hatalı");
        }
        sessions.terminate(auth, request, response);
        return ResponseEntity.noContent().build();
    }
}
