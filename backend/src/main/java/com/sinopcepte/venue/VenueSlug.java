package com.sinopcepte.venue;

public final class VenueSlug {
    private VenueSlug() {}

    public static String slugify(String title) {
        if (title == null) return "";
        return title.toLowerCase()
                .replace("'", "")
                .replace("’", "")
                .replace('ğ', 'g')
                .replace('ü', 'u')
                .replace('ş', 's')
                .replace('ı', 'i')
                .replace('ö', 'o')
                .replace('ç', 'c')
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
    }
}
