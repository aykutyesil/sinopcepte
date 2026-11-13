package com.sinopcepte.pharmacy;

import java.time.OffsetDateTime;
import java.time.ZoneId;

/**
 * {@code GET /api/pharmacy/today} yanıtı. {@code lat}/{@code lng} sayı;
 * {@code updatedAt} İstanbul saat dilimiyle ISO-8601 (ör. "2026-11-08T08:30:12+03:00").
 */
public record PharmacyDto(
        String name,
        String address,
        String phone,
        String phoneFormatted,
        String mapUrl,
        Double lat,
        Double lng,
        OffsetDateTime updatedAt) {

    public static PharmacyDto from(PharmacyDuty d, ZoneId zone) {
        OffsetDateTime at = d.getUpdatedAt() == null ? null
                : d.getUpdatedAt().atZoneSameInstant(zone).toOffsetDateTime();
        return new PharmacyDto(d.getName(), d.getAddress(), d.getPhone(), d.getPhoneFormatted(),
                d.getMapUrl(), d.getLat(), d.getLng(), at);
    }
}
