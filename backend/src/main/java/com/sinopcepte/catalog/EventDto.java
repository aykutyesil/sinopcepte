package com.sinopcepte.catalog;

import com.fasterxml.jackson.annotation.JsonInclude;

/** API'deki etkinlik şekli. Alan adları seed/events.json ile birebir aynıdır. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record EventDto(
        String id,
        String title,
        String venue,
        String location,
        String date,
        String badge,
        String desc,
        String wa) {

    public static EventDto from(LiveEvent e) {
        return new EventDto(e.getId(), e.getTitle(), e.getVenue(), e.getLocation(), e.getDate(),
                e.getBadge(), e.getDesc(), e.getWa());
    }
}
