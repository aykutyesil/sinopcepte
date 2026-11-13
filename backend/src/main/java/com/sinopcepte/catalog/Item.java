package com.sinopcepte.catalog;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Rehber kartı (mekan, tekel, taksi, eczane, çiçek). */
@Entity
@Table(name = "item")
public class Item {

    @Id
    private String id;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String title;

    private String badge;
    private String location;

    /** JSON alanı "desc"; SQL'de ayrılmış kelime olduğu için sütun adı "description". */
    @Column(name = "description")
    private String desc;

    private String phone;
    private String wa;
    private String rating;

    @Column(name = "map_url")
    private String mapUrl;

    @Column(name = "owner_handle")
    private String ownerHandle;

    @Column(name = "photos_json", nullable = false)
    private String photosJson = "[]";

    @Column(name = "menu_json", nullable = false)
    private String menuJson = "[]";

    /** Seed sırasını korumak için iç alan; JSON çıktısında yer almaz. */
    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    protected Item() {
    }

    public Item(String id) {
        this.id = id;
    }

    public String getId() { return id; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getBadge() { return badge; }
    public void setBadge(String badge) { this.badge = badge; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getDesc() { return desc; }
    public void setDesc(String desc) { this.desc = desc; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getWa() { return wa; }
    public void setWa(String wa) { this.wa = wa; }
    public String getRating() { return rating; }
    public void setRating(String rating) { this.rating = rating; }
    public String getMapUrl() { return mapUrl; }
    public void setMapUrl(String mapUrl) { this.mapUrl = mapUrl; }
    public String getOwnerHandle() { return ownerHandle; }
    public void setOwnerHandle(String ownerHandle) { this.ownerHandle = ownerHandle; }
    public String getPhotosJson() { return photosJson; }
    public void setPhotosJson(String photosJson) { this.photosJson = photosJson; }
    public String getMenuJson() { return menuJson; }
    public void setMenuJson(String menuJson) { this.menuJson = menuJson; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
}
