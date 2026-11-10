package com.sinopcepte.venue;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record VenueProfileDto(
        String itemId,
        String slug,
        String title,
        String category,
        String badge,
        String location,
        String desc,
        String phone,
        String wa,
        String rating,
        String mapUrl,
        String ownerHandle,
        List<String> photos,
        List<VenueMenuItem> menu) {
}
