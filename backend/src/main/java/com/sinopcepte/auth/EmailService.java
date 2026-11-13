package com.sinopcepte.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public void sendPasswordResetEmail(String toEmail, String username, String token) {
        String resetLink = frontendUrl + "/sifre-sifirla?token=" + token;

        log.info("=====================================================================");
        log.info("📧 [E-POSTA SERVİSİ] ŞİFRE SIFIRLAMA TALEBİ");
        log.info("Kime: {} (Kullanıcı: @{})", toEmail, username);
        log.info("Sıfırlama Bağlantısı: {}", resetLink);
        log.info("Geçerlilik Süresi: 1 Saat");
        log.info("=====================================================================");

        // Canlı SMTP/SendGrid/Mailgun sağlayıcısı takıldığında buradaki JavaMailSender çalışır.
    }
}
