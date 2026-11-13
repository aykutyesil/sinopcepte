package com.sinopcepte.auth;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.core.NestedExceptionUtils;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sinopcepte.web.FieldConflictException;
import com.sinopcepte.web.FieldError;
import com.sinopcepte.web.ForbiddenException;
import com.sinopcepte.web.UnauthorizedException;
import com.sinopcepte.web.ValidationException;

/** Kayıt, profil, şifre ve hesap silme iş kuralları. Yalnız oturum sahibinin kaydı üzerinde çalışır. */
@Service
public class UserAccountService {

    static final String HANDLE_TAKEN = "Bu rumuz zaten alınmış";
    static final String EMAIL_TAKEN = "Bu e-posta adresiyle kayıtlı bir hesap var";

    /** Normalleştirilmiş, doğrulanmış kayıt girdisi. */
    public record Registration(String handle, String email, String password) {
    }

    public record ProfileUpdate(String avatar, String bio, String instagram, String checkinVisibility,
                                Boolean anonymousMode) {
    }

    private final AppUserRepository users;
    private final PasswordEncoder encoder;
    private final ApplicationEventPublisher events;
    private final Clock clock;
    private final String kvkkVersion;

    public UserAccountService(AppUserRepository users, PasswordEncoder encoder, ApplicationEventPublisher events,
                              Clock clock, @Value("${app.kvkk.version:taslak-1}") String kvkkVersion) {
        this.users = users;
        this.encoder = encoder;
        this.events = events;
        this.clock = clock;
        this.kvkkVersion = kvkkVersion;
    }

    /** 400'ü burada atar (tüm hatalı alanlar birlikte). Rumuz ve e-posta trim + küçük harf. */
    public Registration validateRegistration(String handle, String email, String password, Boolean kvkkAccepted) {
        String h = Handles.normalize(handle);
        String e = Handles.normalize(email);
        List<FieldError> errors = new ArrayList<>();
        UserRules.handle(h, errors);
        UserRules.email(e, errors);
        UserRules.password("password", password, errors);
        if (!Boolean.TRUE.equals(kvkkAccepted)) {
            errors.add(new FieldError("kvkkAccepted", "KVKK aydınlatma metnini onaylamanız gerekiyor"));
        }
        if (!errors.isEmpty()) {
            throw new ValidationException(errors);
        }
        return new Registration(h, e, password);
    }

    /** 409: önce rumuz, sonra e-posta. Yarış durumunda DB'deki lower() index'leri yakalar. */
    public AppUser create(Registration r) {
        if (users.existsByUsername(r.handle())) {
            throw new FieldConflictException("handle", HANDLE_TAKEN);
        }
        if (users.existsByEmail(r.email())) {
            throw new FieldConflictException("email", EMAIL_TAKEN);
        }
        OffsetDateTime now = OffsetDateTime.now(clock);
        AppUser u = new AppUser(r.handle(), encoder.encode(r.password()), Role.USER, now);
        u.setEmail(r.email());
        u.acceptKvkk(kvkkVersion, now);
        try {
            return users.saveAndFlush(u);
        } catch (DataIntegrityViolationException ex) {
            String msg = String.valueOf(NestedExceptionUtils.getMostSpecificCause(ex).getMessage());
            if (msg.contains("app_user_username_lower_uq") || msg.contains("app_user_username_key")) {
                throw new FieldConflictException("handle", HANDLE_TAKEN);
            }
            if (msg.contains("app_user_email_lower_uq")) {
                throw new FieldConflictException("email", EMAIL_TAKEN);
            }
            throw ex;
        }
    }

    @Transactional
    public AppUser updateProfile(Long userId, ProfileUpdate p) {
        String bio = UserRules.blankToNull(p.bio());
        String instagram = UserRules.blankToNull(p.instagram());
        List<FieldError> errors = new ArrayList<>();
        UserRules.avatar(p.avatar(), errors);
        UserRules.bio(bio, errors);
        UserRules.instagram(instagram, errors);
        CheckinVisibility visibility = parseVisibility(p.checkinVisibility());
        if (visibility == null) {
            errors.add(new FieldError("checkinVisibility", "Geçersiz görünürlük (PUBLIC veya HIDDEN olmalı)"));
        }
        if (p.anonymousMode() == null) {
            errors.add(new FieldError("anonymousMode", "Anonim mod değeri zorunlu"));
        }
        if (!errors.isEmpty()) {
            throw new ValidationException(errors);
        }
        AppUser u = load(userId);
        u.updateProfile(p.avatar(), bio, instagram, visibility, p.anonymousMode());
        return u;
    }

    /**
     * Yeni şifre kurallara uymazsa 400; mevcut şifre yanlışsa 401 ({@code currentPassword}).
     * Yanlış mevcut şifre, giriş denemesi gibi hız sınırına sayılır (çağıran kaydeder).
     *
     * @return mevcut şifre doğru mu
     */
    @Transactional
    public boolean changePassword(Long userId, String currentPassword, String newPassword) {
        List<FieldError> errors = new ArrayList<>();
        if (currentPassword == null || currentPassword.isEmpty()) {
            errors.add(new FieldError("currentPassword", "Mevcut şifre zorunlu"));
        }
        UserRules.password("newPassword", newPassword, errors);
        if (!errors.isEmpty()) {
            throw new ValidationException(errors);
        }
        AppUser u = load(userId);
        if (!encoder.matches(currentPassword, u.getPasswordHash())) {
            return false;
        }
        u.setPasswordHash(encoder.encode(newPassword));
        return true;
    }

    /**
     * ADMIN → 403. Şifre yanlışsa {@code false} (çağıran 401 + hız sınırı). Doğruysa
     * {@link UserDeletionEvent} yayımlanır ve satır silinir — ikisi aynı transaction'da.
     */
    @Transactional
    public boolean deleteAccount(Long userId, String password) {
        AppUser u = load(userId);
        if (u.getRole() == Role.ADMIN) {
            throw new ForbiddenException("Yönetici hesabı silinemez");
        }
        if (password == null || password.isEmpty()) {
            throw ValidationException.of("password", "Şifre zorunlu");
        }
        if (!encoder.matches(password, u.getPasswordHash())) {
            return false;
        }
        events.publishEvent(new UserDeletionEvent(u.getId(), u.getUsername()));
        users.delete(u);
        return true;
    }

    private AppUser load(Long id) {
        return users.findById(id)
                .orElseThrow(() -> new UnauthorizedException("Oturum geçersiz. Lütfen yeniden giriş yapın."));
    }

    private static CheckinVisibility parseVisibility(String v) {
        if (v == null) {
            return null;
        }
        for (CheckinVisibility c : CheckinVisibility.values()) {
            if (c.name().equals(v)) {
                return c;
            }
        }
        return null;
    }
}
