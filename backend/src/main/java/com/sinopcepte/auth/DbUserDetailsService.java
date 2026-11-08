package com.sinopcepte.auth;

import java.util.Optional;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Girişte {@code username} rumuz <b>veya</b> e-posta olabilir; aramadan önce trim + küçük harf.
 * Dönen kimliğin adı her zaman rumuzdur (e-postayla girilse bile).
 */
@Service
public class DbUserDetailsService implements UserDetailsService {

    private final AppUserRepository users;

    public DbUserDetailsService(AppUserRepository users) {
        this.users = users;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
        String key = Handles.normalize(login);
        if (key == null || key.isEmpty()) {
            throw new UsernameNotFoundException("Kullanıcı yok");
        }
        // Rumuzda '@' olamaz; önce rumuz, bulunamazsa ve '@' varsa e-posta.
        AppUser u = users.findByUsername(key)
                .or(() -> key.contains("@") ? users.findByEmail(key) : Optional.empty())
                .orElseThrow(() -> new UsernameNotFoundException("Kullanıcı yok"));
        return AppUserPrincipal.of(u);
    }
}
