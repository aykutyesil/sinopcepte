package com.sinopcepte.catalog;

import java.util.List;

/** İzin verilen kart kategorileri (V1 şemasındaki check kısıtıyla aynı küme). */
public final class Categories {

    public static final List<String> ALL = List.of("mekan", "tekel", "taksi", "eczane", "cicek");

    /** Bean Validation @Pattern için. */
    public static final String REGEX = "mekan|tekel|taksi|eczane|cicek";

    private Categories() {
    }

    public static boolean isValid(String category) {
        return category != null && ALL.contains(category);
    }
}
