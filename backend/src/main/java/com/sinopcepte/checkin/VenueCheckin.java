package com.sinopcepte.checkin;

import java.time.OffsetDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "venue_checkin")
public class VenueCheckin {

    @Id
    private String id;

    @Column(name = "item_id", nullable = false)
    private String itemId;

    @Column(nullable = false)
    private String handle;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(nullable = false)
    private String avatar;

    private String note;
    private String mood;

    @Column(name = "checked_in_at", nullable = false)
    private OffsetDateTime checkedInAt;

    protected VenueCheckin() {
    }

    public VenueCheckin(String id, String itemId, String handle, String displayName, String avatar, String note, String mood, OffsetDateTime checkedInAt) {
        this.id = id;
        this.itemId = itemId;
        this.handle = handle;
        this.displayName = displayName;
        this.avatar = avatar;
        this.note = note;
        this.mood = mood;
        this.checkedInAt = checkedInAt;
    }

    public String getId() { return id; }
    public String getItemId() { return itemId; }
    public String getHandle() { return handle; }
    public String getDisplayName() { return displayName; }
    public String getAvatar() { return avatar; }
    public String getNote() { return note; }
    public String getMood() { return mood; }
    public OffsetDateTime getCheckedInAt() { return checkedInAt; }
}
