package com.sinopcepte.auth;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sinopcepte.web.BadRequestException;
import com.sinopcepte.web.NotFoundException;

@Service
public class PasswordResetService {

    public record ForgotPasswordResponse(
        String message,
        String token,
        String emailMasked
    ) {}

    private final AppUserRepository userRepo;
    private final PasswordResetTokenRepository tokenRepo;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetService(
        AppUserRepository userRepo,
        PasswordResetTokenRepository tokenRepo,
        EmailService emailService,
        PasswordEncoder passwordEncoder
    ) {
        this.userRepo = userRepo;
        this.tokenRepo = tokenRepo;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public ForgotPasswordResponse requestReset(String emailOrHandle) {
        if (emailOrHandle == null || emailOrHandle.isBlank()) {
            throw new BadRequestException("E-posta veya kullanıcı adı girilmelidir");
        }

        String clean = emailOrHandle.trim().toLowerCase().replaceAll("^@", "");
        Optional<AppUser> userOpt = userRepo.findByUsername(clean);
        if (userOpt.isEmpty()) {
            userOpt = userRepo.findByEmail(clean);
        }

        if (userOpt.isEmpty()) {
            throw new NotFoundException("Bu kullanıcı adı veya e-posta ile kayıtlı bir hesap bulunamadı");
        }

        AppUser user = userOpt.get();
        String targetEmail = user.getEmail();
        if (targetEmail == null || targetEmail.isBlank()) {
            // Eğer kullanıcının kayıtlı e-postası yoksa varsayılan test adresi
            targetEmail = user.getUsername() + "@sinopcepte.com";
        }

        String token = UUID.randomUUID().toString();
        OffsetDateTime expiresAt = OffsetDateTime.now().plusHours(1);

        PasswordResetToken resetToken = new PasswordResetToken(token, user.getId(), targetEmail, expiresAt);
        tokenRepo.save(resetToken);

        emailService.sendPasswordResetEmail(targetEmail, user.getUsername(), token);

        String maskedEmail = maskEmail(targetEmail);
        return new ForgotPasswordResponse(
            "Şifre sıfırlama bağlantısı " + maskedEmail + " adresine iletildi.",
            token,
            maskedEmail
        );
    }

    @Transactional(readOnly = true)
    public boolean validateToken(String token) {
        if (token == null || token.isBlank()) return false;
        Optional<PasswordResetToken> tokenOpt = tokenRepo.findByTokenAndUsedFalse(token.trim());
        return tokenOpt.isPresent() && !tokenOpt.get().isExpired();
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        if (token == null || token.isBlank()) {
            throw new BadRequestException("Geçersiz sıfırlama kodu");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new BadRequestException("Yeni şifre en az 6 karakter olmalıdır");
        }

        PasswordResetToken resetToken = tokenRepo.findByTokenAndUsedFalse(token.trim())
            .orElseThrow(() -> new BadRequestException("Bu sıfırlama bağlantısı geçersiz veya daha önce kullanılmış"));

        if (resetToken.isExpired()) {
            throw new BadRequestException("Sıfırlama bağlantısının 1 saatlik kullanım süresi dolmuş");
        }

        AppUser user = userRepo.findById(resetToken.getUserId())
            .orElseThrow(() -> new NotFoundException("Kullanıcı hesabı bulunamadı"));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepo.save(user);

        resetToken.setUsed(true);
        tokenRepo.save(resetToken);
    }

    private String maskEmail(String email) {
        int atIndex = email.indexOf("@");
        if (atIndex <= 1) return email;
        String name = email.substring(0, atIndex);
        String domain = email.substring(atIndex);
        if (name.length() <= 3) {
            return name.charAt(0) + "***" + domain;
        }
        return name.charAt(0) + "***" + name.charAt(name.length() - 1) + domain;
    }
}
