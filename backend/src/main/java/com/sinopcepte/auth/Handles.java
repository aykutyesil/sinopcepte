package com.sinopcepte.auth;

import java.util.Locale;

/** Rumuz/e-posta normalleştirme. Locale.ROOT şart: Türkçe yerelde "I".toLowerCase() → "ı" olur. */
public final class Handles {

    private Handles() {
    }

    /** trim + küçük harf; null → null. */
    public static String normalize(String s) {
        return s == null ? null : s.trim().toLowerCase(Locale.ROOT);
    }
}
