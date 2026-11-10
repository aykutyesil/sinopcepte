package com.sinopcepte.auth;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Uygulama kullanıcısı. {@code username} kolonu rumuzdur (handle): küçük harfle saklanır,
 * büyük/küçük harf duyarsız tekildir (V10'daki lower() index'i ve check kısıtı).
 */
@Entity
@Table(name = "app_user")
public class AppUser {

    public static final String DEFAULT_AVATAR = "marti";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    /** BCrypt özeti; düz parola hiçbir yerde saklanmaz. */
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    /** Küçük harf; admin'de null. */
    private String email;

    // Hibernate her kolonu açıkça yazar, DB varsayılanları devreye girmez → varsayılanlar burada.
    @Column(nullable = false)
    private String avatar = DEFAULT_AVATAR;

    private String bio;

    private String instagram;

    @Enumerated(EnumType.STRING)
    @Column(name = "checkin_visibility", nullable = false)
    private CheckinVisibility checkinVisibility = CheckinVisibility.PUBLIC;

    @Column(name = "anonymous_mode", nullable = false)
    private boolean anonymousMode = false;

    private String phone;

    @Column(name = "badges_json", nullable = false)
    private String badgesJson = "[]";

    @Column(name = "kvkk_accepted_at")
    private OffsetDateTime kvkkAcceptedAt;

    @Column(name = "kvkk_version")
    private String kvkkVersion;

    protected AppUser() {
    }

    public AppUser(String username, String passwordHash, Role role, OffsetDateTime createdAt) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.role = role;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getPasswordHash() { return passwordHash; }
    public Role getRole() { return role; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public String getEmail() { return email; }
    public String getAvatar() { return avatar; }
    public String getBio() { return bio; }
    public String getInstagram() { return instagram; }
    public CheckinVisibility getCheckinVisibility() { return checkinVisibility; }
    public boolean isAnonymousMode() { return anonymousMode; }
    public String getPhone() { return phone; }
    public String getBadgesJson() { return badgesJson; }
    public OffsetDateTime getKvkkAcceptedAt() { return kvkkAcceptedAt; }
    public String getKvkkVersion() { return kvkkVersion; }

    public void setPhone(String phone) { this.phone = phone; }
    public void setBadgesJson(String badgesJson) { this.badgesJson = badgesJson; }
    public void setEmail(String email) { this.email = email; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public void acceptKvkk(String version, OffsetDateTime at) {
        this.kvkkVersion = version;
        this.kvkkAcceptedAt = at;
    }

    public void updateProfile(String avatar, String bio, String instagram, CheckinVisibility visibility,
                              boolean anonymousMode) {
        this.avatar = avatar;
        this.bio = bio;
        this.instagram = instagram;
        this.checkinVisibility = visibility;
        this.anonymousMode = anonymousMode;
    }
}
