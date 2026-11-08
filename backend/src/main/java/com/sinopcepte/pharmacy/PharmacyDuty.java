package com.sinopcepte.pharmacy;

import java.time.LocalDate;
import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Bir günün nöbetçi eczane kaydı. Gün başına tek kayıt ({@code duty_date} unique). */
@Entity
@Table(name = "pharmacy_duty")
public class PharmacyDuty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "duty_date", nullable = false, unique = true)
    private LocalDate dutyDate;

    @Column(nullable = false)
    private String name;

    private String address;

    /** Kaynakta göründüğü haliyle, ör. "0 (368) 261-72-36". */
    private String phone;

    /** Yalnız rakam, başta 0, ör. "03682617236". */
    @Column(name = "phone_formatted")
    private String phoneFormatted;

    @Column(name = "map_url")
    private String mapUrl;

    private Double lat;
    private Double lng;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected PharmacyDuty() {
    }

    public PharmacyDuty(LocalDate dutyDate) {
        this.dutyDate = dutyDate;
    }

    /** Ayrıştırılmış veriyi bu kayda uygular. */
    public void apply(ParsedPharmacy p, OffsetDateTime now) {
        this.name = p.name();
        this.address = p.address();
        this.phone = p.phone();
        this.phoneFormatted = p.phoneFormatted();
        this.mapUrl = p.mapUrl();
        this.lat = p.lat();
        this.lng = p.lng();
        this.updatedAt = now;
    }

    public Long getId() { return id; }
    public LocalDate getDutyDate() { return dutyDate; }
    public String getName() { return name; }
    public String getAddress() { return address; }
    public String getPhone() { return phone; }
    public String getPhoneFormatted() { return phoneFormatted; }
    public String getMapUrl() { return mapUrl; }
    public Double getLat() { return lat; }
    public Double getLng() { return lng; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
