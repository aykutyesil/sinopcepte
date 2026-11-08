package com.sinopcepte.auth;

import java.util.Collection;
import java.util.List;
import java.util.Objects;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

/**
 * Oturumdaki kimlik: rumuzun yanında kullanıcı id'sini de taşır. Silinen bir hesabın rumuzu başkası
 * tarafından yeniden alınsa bile eski oturum yeni hesaba geçmez ({@link CurrentUser} id ile çözer).
 */
public class AppUserPrincipal extends User {

    private final Long id;

    public AppUserPrincipal(Long id, String username, String passwordHash,
                            Collection<? extends GrantedAuthority> authorities) {
        super(username, passwordHash, authorities);
        this.id = id;
    }

    public static AppUserPrincipal of(AppUser u) {
        return new AppUserPrincipal(u.getId(), u.getUsername(), u.getPasswordHash(),
                List.of(new SimpleGrantedAuthority("ROLE_" + u.getRole().name())));
    }

    public Long getId() {
        return id;
    }

    @Override
    public boolean equals(Object o) {
        return o instanceof AppUserPrincipal p && super.equals(o) && Objects.equals(id, p.id);
    }

    @Override
    public int hashCode() {
        return super.hashCode();
    }
}
