package com.sinopcepte.venue;

import java.time.OffsetDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "venue_claim_request")
public class VenueClaimRequest {

    @Id
    private String id;

    @Column(name = "item_id", nullable = false)
    private String itemId;

    @Column(name = "venue_title", nullable = false)
    private String venueTitle;

    @Column(name = "user_handle", nullable = false)
    private String userHandle;

    private String phone;
    private String note;

    @Column(nullable = false)
    private String status = "PENDING";

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected VenueClaimRequest() {
    }

    public VenueClaimRequest(String id, String itemId, String venueTitle, String userHandle, String phone, String note, OffsetDateTime createdAt) {
        this.id = id;
        this.itemId = itemId;
        this.venueTitle = venueTitle;
        this.userHandle = userHandle;
        this.phone = phone;
        this.note = note;
        this.status = "PENDING";
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public String getItemId() { return itemId; }
    public String getVenueTitle() { return venueTitle; }
    public String getUserHandle() { return userHandle; }
    public String getPhone() { return phone; }
    public String getNote() { return note; }
    public String getStatus() { return status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }

    public void setStatus(String status) { this.status = status; }
}
