package com.sinopcepte.user;

import java.time.Clock;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sinopcepte.auth.AppUserRepository;
import com.sinopcepte.auth.Handles;
import com.sinopcepte.auth.Role;
import com.sinopcepte.web.NotFoundException;

/**
 * Herkese açık profil. Yalnız okuma: bu denetleyicide (ve başka hiçbir yerde) başka bir kullanıcıyı
 * düzenleyen uç yoktur. ADMIN hesapları 404 döner (yönetici giriş adı dışarı açılmaz).
 */
@RestController
@RequestMapping("/api/users")
public class PublicUserController {

    private final AppUserRepository users;
    private final Clock clock;

    public PublicUserController(AppUserRepository users, Clock clock) {
        this.users = users;
        this.clock = clock;
    }

    @GetMapping("/{handle}")
    public PublicProfile get(@PathVariable String handle) {
        return users.findByUsername(Handles.normalize(handle))
                .filter(u -> u.getRole() != Role.ADMIN)
                .map(u -> PublicProfile.of(u, clock.getZone()))
                .orElseThrow(() -> new NotFoundException("Kullanıcı bulunamadı"));
    }
}
