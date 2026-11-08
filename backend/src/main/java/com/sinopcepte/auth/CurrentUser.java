package com.sinopcepte.auth;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.sinopcepte.web.UnauthorizedException;

/**
 * Oturumdaki kullanıcıyı veritabanından <b>id ile</b> çözer. Hesap silinmişse (başka tarayıcıdaki eski
 * oturum) 401 döner. N8–N10 modülleri de oturum sahibini buradan almalı; rumuz metnine güvenmemeli.
 */
@Component
public class CurrentUser {

    private final AppUserRepository users;

    public CurrentUser(AppUserRepository users) {
        this.users = users;
    }

    public AppUser require(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof AppUserPrincipal p) || p.getId() == null) {
            throw new UnauthorizedException("Oturum geçersiz. Lütfen yeniden giriş yapın.");
        }
        return users.findById(p.getId())
                .filter(u -> u.getUsername().equals(p.getUsername()))
                .orElseThrow(() -> new UnauthorizedException("Oturum geçersiz. Lütfen yeniden giriş yapın."));
    }
}
