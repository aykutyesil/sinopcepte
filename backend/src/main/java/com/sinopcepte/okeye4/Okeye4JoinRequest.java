package com.sinopcepte.okeye4;

import java.time.OffsetDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "okeye4_join_request")
public class Okeye4JoinRequest {

    @Id
    private String id;

    @Column(name = "lobby_id", nullable = false)
    private String lobbyId;

    @Column(name = "applicant_handle", nullable = false)
    private String applicantHandle;

    @Column(name = "applicant_name", nullable = false)
    private String applicantName;

    @Column(name = "applicant_avatar", nullable = false)
    private String applicantAvatar;

    @Column(name = "applicant_trust_score", nullable = false)
    private int applicantTrustScore = 95;

    @Column(name = "applicant_phone")
    private String applicantPhone;

    private String note;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    protected Okeye4JoinRequest() {
    }

    public Okeye4JoinRequest(String id, String lobbyId, String applicantHandle, String applicantName,
                             String applicantAvatar, int applicantTrustScore, String applicantPhone,
                             String note, String status, OffsetDateTime createdAt) {
        this.id = id;
        this.lobbyId = lobbyId;
        this.applicantHandle = applicantHandle;
        this.applicantName = applicantName;
        this.applicantAvatar = applicantAvatar;
        this.applicantTrustScore = applicantTrustScore;
        this.applicantPhone = applicantPhone;
        this.note = note;
        this.status = status;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public String getLobbyId() { return lobbyId; }
    public String getApplicantHandle() { return applicantHandle; }
    public String getApplicantName() { return applicantName; }
    public String getApplicantAvatar() { return applicantAvatar; }
    public int getApplicantTrustScore() { return applicantTrustScore; }
    public String getApplicantPhone() { return applicantPhone; }
    public String getNote() { return note; }
    public String getStatus() { return status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }

    public void setStatus(String status) { this.status = status; }
}
