package com.sinopcepte.taxi;

import java.time.OffsetDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "taxi_lobby_member")
public class TaxiLobbyMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lobby_id", nullable = false, length = 64)
    private String lobbyId;

    @Column(name = "user_handle", nullable = false, length = 64)
    private String userHandle;

    @Column(name = "user_name", nullable = false, length = 100)
    private String userName;

    @Column(name = "user_avatar", nullable = false, length = 32)
    private String userAvatar = "student";

    @Column(name = "user_phone", length = 32)
    private String userPhone;

    @Column(name = "joined_at", nullable = false)
    private OffsetDateTime joinedAt = OffsetDateTime.now();

    protected TaxiLobbyMember() {
    }

    public TaxiLobbyMember(String lobbyId, String userHandle, String userName, String userAvatar, String userPhone, OffsetDateTime joinedAt) {
        this.lobbyId = lobbyId;
        this.userHandle = userHandle;
        this.userName = userName;
        this.userAvatar = userAvatar != null ? userAvatar : "student";
        this.userPhone = userPhone;
        this.joinedAt = joinedAt != null ? joinedAt : OffsetDateTime.now();
    }

    public Long getId() { return id; }
    public String getLobbyId() { return lobbyId; }
    public String getUserHandle() { return userHandle; }
    public String getUserName() { return userName; }
    public String getUserAvatar() { return userAvatar; }
    public String getUserPhone() { return userPhone; }
    public OffsetDateTime getJoinedAt() { return joinedAt; }

    public void setUserPhone(String userPhone) { this.userPhone = userPhone; }
}
