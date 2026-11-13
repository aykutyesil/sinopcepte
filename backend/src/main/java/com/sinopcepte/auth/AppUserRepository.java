package com.sinopcepte.auth;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

/** Rumuz ve e-posta küçük harfle saklanır; çağıran taraf aramadan önce {@link Handles#normalize} uygular. */
public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByUsername(String username);

    Optional<AppUser> findByEmail(String email);

    boolean existsByRole(Role role);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
