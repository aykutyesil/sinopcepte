package com.sinopcepte.notification;

import java.time.OffsetDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "app_notification")
public class AppNotification {

    @Id
    private String id;

    @Column(name = "recipient_handle")
    private String recipientHandle;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String body;

    @Column(name = "time_label", nullable = false)
    private String timeLabel;

    @Column(nullable = false)
    private boolean read = false;

    private String href;

    @Column(name = "action_label")
    private String actionLabel;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected AppNotification() {
    }

    public AppNotification(String id, String recipientHandle, String type, String title, String body,
                           String timeLabel, boolean read, String href, String actionLabel, OffsetDateTime createdAt) {
        this.id = id;
        this.recipientHandle = recipientHandle;
        this.type = type;
        this.title = title;
        this.body = body;
        this.timeLabel = timeLabel;
        this.read = read;
        this.href = href;
        this.actionLabel = actionLabel;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public String getRecipientHandle() { return recipientHandle; }
    public String getType() { return type; }
    public String getTitle() { return title; }
    public String getBody() { return body; }
    public String getTimeLabel() { return timeLabel; }
    public boolean isRead() { return read; }
    public String getHref() { return href; }
    public String getActionLabel() { return actionLabel; }
    public OffsetDateTime getCreatedAt() { return createdAt; }

    public void setRead(boolean read) { this.read = read; }
}
