package com.sinopcepte.taxi;

import java.time.OffsetDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "taxi_lobby")
public class TaxiLobby {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "host_handle", nullable = false, length = 64)
    private String hostHandle;

    @Column(name = "host_name", nullable = false, length = 100)
    private String hostName;

    @Column(name = "host_avatar", nullable = false, length = 32)
    private String hostAvatar = "student";

    @Column(name = "host_phone", length = 32)
    private String hostPhone;

    @Column(nullable = false, length = 150)
    private String destination;

    @Column(name = "departure_point", nullable = false, length = 150)
    private String departurePoint;

    @Column(name = "departure_time", nullable = false, length = 64)
    private String departureTime;

    @Column(name = "total_seats", nullable = false)
    private int totalSeats = 4;

    @Column(name = "occupied_seats", nullable = false)
    private int occupiedSeats = 1;

    @Column(name = "estimated_fare", length = 64)
    private String estimatedFare;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(nullable = false, length = 32)
    private String status = "OPEN";

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    protected TaxiLobby() {
    }

    public TaxiLobby(String id, String hostHandle, String hostName, String hostAvatar, String hostPhone,
                     String destination, String departurePoint, String departureTime, int totalSeats,
                     int occupiedSeats, String estimatedFare, String note, String status, OffsetDateTime createdAt) {
        this.id = id;
        this.hostHandle = hostHandle;
        this.hostName = hostName;
        this.hostAvatar = hostAvatar != null ? hostAvatar : "student";
        this.hostPhone = hostPhone;
        this.destination = destination;
        this.departurePoint = departurePoint;
        this.departureTime = departureTime;
        this.totalSeats = totalSeats > 0 ? totalSeats : 4;
        this.occupiedSeats = occupiedSeats > 0 ? occupiedSeats : 1;
        this.estimatedFare = estimatedFare;
        this.note = note;
        this.status = status != null ? status : "OPEN";
        this.createdAt = createdAt != null ? createdAt : OffsetDateTime.now();
    }

    public String getId() { return id; }
    public String getHostHandle() { return hostHandle; }
    public String getHostName() { return hostName; }
    public String getHostAvatar() { return hostAvatar; }
    public String getHostPhone() { return hostPhone; }
    public String getDestination() { return destination; }
    public String getDeparturePoint() { return departurePoint; }
    public String getDepartureTime() { return departureTime; }
    public int getTotalSeats() { return totalSeats; }
    public int getOccupiedSeats() { return occupiedSeats; }
    public String getEstimatedFare() { return estimatedFare; }
    public String getNote() { return note; }
    public String getStatus() { return status; }
    public OffsetDateTime getCreatedAt() { return createdAt; }

    public void setOccupiedSeats(int occupiedSeats) { this.occupiedSeats = occupiedSeats; }
    public void setStatus(String status) { this.status = status; }
    public void setHostPhone(String hostPhone) { this.hostPhone = hostPhone; }
    public void setEstimatedFare(String estimatedFare) { this.estimatedFare = estimatedFare; }
    public void setNote(String note) { this.note = note; }
}
