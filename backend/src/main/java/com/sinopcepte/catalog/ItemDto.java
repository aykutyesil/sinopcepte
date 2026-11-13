package com.sinopcepte.catalog;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * API'deki kart şekli. Alan adları seed/items.json ile birebir aynıdır.
 * Null alanlar (ör. çoğu kartta {@code mapUrl}) çıktıya yazılmaz; seed dosyası da böyle.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ItemDto(
        String id,
        String category,
        String title,
        String badge,
        String location,
        String desc,
        String phone,
        String wa,
        String rating,
        String mapUrl) {

    public static ItemDto from(Item i) {
        return new ItemDto(i.getId(), i.getCategory(), i.getTitle(), i.getBadge(), i.getLocation(),
                i.getDesc(), i.getPhone(), i.getWa(), i.getRating(), i.getMapUrl());
    }
}
