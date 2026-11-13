package com.sinopcepte.catalog;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Canlı etkinlik / maç yayını kartı. */
@Entity
@Table(name = "live_event")
public class LiveEvent {

    @Id
    private String id;

    @Column(nullable = false)
    private String title;

    private String venue;
    private String location;

    /** Serbest metin etiket, ör. "Bugün Canlı • 20:00". JSON alanı: "date". */
    @Column(name = "date_label")
    private String date;

    private String badge;

    @Column(name = "description")
    private String desc;

    private String wa;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    protected LiveEvent() {
    }

    public LiveEvent(String id) {
        this.id = id;
    }

    public String getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getBadge() { return badge; }
    public void setBadge(String badge) { this.badge = badge; }
    public String getDesc() { return desc; }
    public void setDesc(String desc) { this.desc = desc; }
    public String getWa() { return wa; }
    public void setWa(String wa) { this.wa = wa; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
}
