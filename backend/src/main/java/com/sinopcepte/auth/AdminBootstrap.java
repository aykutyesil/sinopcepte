package com.sinopcepte.auth;

import java.time.Clock;
import java.time.OffsetDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Açılışta hiç ADMIN yoksa ADMIN_USERNAME / ADMIN_PASSWORD ile bir tane oluşturur.
 * Değişkenler yoksa admin oluşturmaz ve uyarı loglar.
 */
@Component
public class AdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final AppUserRepository users;
    private final PasswordEncoder encoder;
    private final AdminProperties props;
    private final Clock clock;

    public AdminBootstrap(AppUserRepository users, PasswordEncoder encoder, AdminProperties props, Clock clock) {
        this.users = users;
        this.encoder = encoder;
        this.props = props;
        this.clock = clock;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (users.existsByRole(Role.ADMIN)) {
            return;
        }
        // Rumuzlar küçük harfle saklanır (V10 kısıtı); giriş de küçültüp arar.
        String username = props.username() == null ? "" : Handles.normalize(props.username());
        String password = props.password() == null ? "" : props.password();
        if (username.isEmpty() || password.isEmpty()) {
            log.warn("Hiç ADMIN kullanıcı yok ve ADMIN_USERNAME / ADMIN_PASSWORD tanımlı değil; admin oluşturulmadı. "
                    + "Admin paneline giriş yapılamaz.");
            return;
        }
        if (users.existsByUsername(username)) {
            log.warn("ADMIN_USERNAME='{}' zaten ADMIN olmayan bir kullanıcıya ait; admin oluşturulmadı.", username);
            return;
        }
        if (password.length() < 12) {
            log.warn("ADMIN_PASSWORD 12 karakterden kısa; daha uzun bir parola önerilir.");
        }
        users.save(new AppUser(username, encoder.encode(password), Role.ADMIN, OffsetDateTime.now(clock)));
        log.info("ADMIN kullanıcı oluşturuldu: {}", username);
    }
}
