package com.sinopcepte.pharmacy;

/** eczaneler.gen.tr iframe sayfasından ayrıştırılan ham veri. */
public record ParsedPharmacy(
        String name,
        String address,
        String phone,
        String phoneFormatted,
        String mapUrl,
        Double lat,
        Double lng) {
}
