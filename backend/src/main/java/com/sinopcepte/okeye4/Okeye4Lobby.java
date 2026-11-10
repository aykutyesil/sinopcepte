package com.sinopcepte.okeye4;

import java.time.OffsetDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "okeye4_lobby")
public class Okeye4Lobby {

    @Id
    private String id;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String venue;

    @Column(nullable = false)
    private String district;

    @Column(name = "current_players", nullable = false)
    private int currentPlayers;

    @Column(name = "max_players", nullable = false)
    private int maxPlayers;

    @Column(name = "start_time", nullable = false)
    private String startTime;

    @Column(name = "expires_in", nullable = false)
    private String expiresIn;

    @Column(name = "host_handle", nullable = false)
    private String hostHandle;

    @Column(name = "host_name", nullable = false)
    private String hostName;

    @Column(name = "host_avatar", nullable = false)
    private String hostAvatar;

    @Column(name = "host_trust_score", nullable = false)
    private int hostTrustScore = 95;

    @Column(name = "host_badge", nullable = false)
    private String hostBadge = "Sinoplu Üye";

    @Column(name = "host_phone")
    private String hostPhone;

    @Column(name = "host_wa")
    private String hostWa;

    private String note;

    @Column(nullable = false)
    private String status = "OPEN";

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected Okeye4Lobby() {
    }

    public Okeye4Lobby(String id, String category, String title, String venue, String district,
                       int currentPlayers, int maxPlayers, String startTime, String expiresIn,
                       String hostHandle, String hostName, String hostAvatar, int hostTrustScore,
                       String hostBadge, String hostPhone, String hostWa, String note,
                       String status, OffsetDateTime createdAt) {
        this.id = id;
        this.category = category;
        this.title = title;
        this.venue = venue;
        this.district = district;
        this.currentPlayers = currentPlayers;
        this.maxPlayers = maxPlayers;
        this.startTime = startTime;
        this.expiresIn = expiresIn;
        this.hostHandle = hostHandle;
        this.hostName = hostName;
        this.hostAvatar = hostAvatar;
        this.hostTrustScore = hostTrustScore;
        this.hostBadge = hostBadge;
        this.hostPhone = hostPhone;
        this.hostWa = hostWa;
        this.note = note;
        this.status = status;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public String getCategory() { return category; }
    public String getTitle() { return title; }
    public String getVenue() { return venue; }
    public String getDistrict() { return district; }
    public int getCurrentPlayers() { return currentPlayers; }
    public int getMaxPlayers() { return maxPlayers; }
    public String getStartTime() { return startTime; }
    public String getExpiresIn() { return expiresIn; }
    public String getHostHandle() { return hostHandle; }
    public String getHostName() { return hostName; }
    public String getHostAvatar() { return hostAvatar; }
    public int getHostTrustScore() { return hostTrustScore; }
    public String getHostBadge() { return hostBadge; }
    public String getHostPhone() { return hostPhone; }
    public String getHostWa() { return hostWa; }
    public String getNote() { return note; }
    public String getStatus() { return status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }

    public void setCurrentPlayers(int currentPlayers) { this.currentPlayers = currentPlayers; }
    public void setStatus(String status) { this.status = status; }
}
