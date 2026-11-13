package com.sinopcepte.confession;

import java.time.OffsetDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "confession")
public class Confession {

    @Id
    private String id;

    @Column(name = "author_handle", nullable = false)
    private String authorHandle;

    @Column(name = "alias_name", nullable = false)
    private String aliasName;

    @Column(name = "alias_avatar", nullable = false)
    private String aliasAvatar = "marti";

    @Column(name = "venue_id")
    private String venueId;

    @Column(name = "venue_title")
    private String venueTitle;

    @Column(nullable = false)
    private String category = "gece";

    @Column(nullable = false, length = 1000)
    private String body;

    @Column(name = "fire_count", nullable = false)
    private int fireCount = 0;

    @Column(name = "laugh_count", nullable = false)
    private int laughCount = 0;

    @Column(name = "shock_count", nullable = false)
    private int shockCount = 0;

    @Column(name = "heart_count", nullable = false)
    private int heartCount = 0;

    @Column(name = "report_count", nullable = false)
    private int reportCount = 0;

    @Column(nullable = false)
    private boolean hidden = false;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected Confession() {
    }

    public Confession(String id, String authorHandle, String aliasName, String aliasAvatar,
                      String venueId, String venueTitle, String category, String body,
                      OffsetDateTime createdAt) {
        this.id = id;
        this.authorHandle = authorHandle;
        this.aliasName = aliasName;
        this.aliasAvatar = aliasAvatar != null ? aliasAvatar : "marti";
        this.venueId = venueId;
        this.venueTitle = venueTitle;
        this.category = category != null ? category : "gece";
        this.body = body;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public String getAuthorHandle() { return authorHandle; }
    public String getAliasName() { return aliasName; }
    public String getAliasAvatar() { return aliasAvatar; }
    public String getVenueId() { return venueId; }
    public String getVenueTitle() { return venueTitle; }
    public String getCategory() { return category; }
    public String getBody() { return body; }
    public int getFireCount() { return fireCount; }
    public int getLaughCount() { return laughCount; }
    public int getShockCount() { return shockCount; }
    public int getHeartCount() { return heartCount; }
    public int getReportCount() { return reportCount; }
    public boolean isHidden() { return hidden; }
    public OffsetDateTime getCreatedAt() { return createdAt; }

    public void setFireCount(int fireCount) { this.fireCount = fireCount; }
    public void setLaughCount(int laughCount) { this.laughCount = laughCount; }
    public void setShockCount(int shockCount) { this.shockCount = shockCount; }
    public void setHeartCount(int heartCount) { this.heartCount = heartCount; }
    public void setReportCount(int reportCount) { this.reportCount = reportCount; }
    public void setHidden(boolean hidden) { this.hidden = hidden; }
}
