package com.sinopcepte.auth;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

import com.sinopcepte.web.FieldError;

/**
 * Rumuz, e-posta, şifre ve profil alanı kuralları (graph.md "N7 ayrıntısı"). Frontend aynı kuralları
 * ve aynı örnekleri kullanır. Her yöntem hatayı listeye ekler; alan başına en fazla bir hata.
 * Girdiler burada normalleştirilmiş (trim/küçük harf) olarak gelir.
 */
public final class UserRules {

    private UserRules() {
    }

    public static final List<String> AVATARS = List.of(
            "marti", "hamsi", "fener", "kale", "dalga", "capa", "balik", "yildiz", "gunes", "ay", "kedi", "yunus");

    public static final Set<String> RESERVED_HANDLES = Set.of(
            "admin", "root", "sinopcepte", "destek", "moderator", "api", "giris", "kayit", "profil", "kvkk");

    public static final int HANDLE_MIN = 3;
    public static final int HANDLE_MAX = 20;
    public static final int PASSWORD_MIN = 8;
    /** BCrypt yalnız ilk 72 baytı kullanır; Spring Security daha uzununu reddeder. */
    public static final int PASSWORD_MAX_BYTES = 72;
    public static final int EMAIL_MAX = 254;
    public static final int BIO_MAX = 160;

    private static final Pattern HANDLE = Pattern.compile("^[a-z0-9_.]+$");
    private static final Pattern EMAIL = Pattern.compile("^[a-z0-9._%+-]+@[a-z0-9-]+(\\.[a-z0-9-]+)*\\.[a-z]{2,}$");
    private static final Pattern INSTAGRAM = Pattern.compile("^[A-Za-z0-9_.]{1,30}$");

    public static void handle(String h, List<FieldError> errors) {
        if (h == null || h.isEmpty()) {
            errors.add(new FieldError("handle", "Rumuz zorunlu"));
        } else if (h.length() < HANDLE_MIN || h.length() > HANDLE_MAX) {
            errors.add(new FieldError("handle", "Rumuz 3–20 karakter olmalı"));
        } else if (!HANDLE.matcher(h).matches()) {
            errors.add(new FieldError("handle",
                    "Rumuz yalnızca küçük harf, rakam, alt çizgi (_) ve nokta (.) içerebilir"));
        } else if (RESERVED_HANDLES.contains(h)) {
            errors.add(new FieldError("handle", "Bu rumuz kullanılamaz"));
        }
    }

    public static void email(String e, List<FieldError> errors) {
        if (e == null || e.isEmpty()) {
            errors.add(new FieldError("email", "E-posta zorunlu"));
        } else if (e.length() > EMAIL_MAX || !EMAIL.matcher(e).matches()) {
            errors.add(new FieldError("email", "Geçerli bir e-posta adresi girin"));
        }
    }

    public static void password(String field, String p, List<FieldError> errors) {
        if (p == null || p.length() < PASSWORD_MIN) {
            errors.add(new FieldError(field, "Şifre en az 8 karakter olmalı"));
        } else if (p.getBytes(StandardCharsets.UTF_8).length > PASSWORD_MAX_BYTES) {
            errors.add(new FieldError(field, "Şifre en fazla 72 bayt olabilir"));
        }
    }

    public static void avatar(String a, List<FieldError> errors) {
        if (a == null || !AVATARS.contains(a)) {
            errors.add(new FieldError("avatar", "Geçersiz avatar"));
        }
    }

    /** {@code b} trim edilmiş, boşsa null. Uzunluk Unicode karakter (code point) sayısıdır. */
    public static void bio(String b, List<FieldError> errors) {
        if (b != null && b.codePointCount(0, b.length()) > BIO_MAX) {
            errors.add(new FieldError("bio", "Biyografi en fazla 160 karakter olabilir"));
        }
    }

    /** {@code i} trim edilmiş, boşsa null. */
    public static void instagram(String i, List<FieldError> errors) {
        if (i != null && !INSTAGRAM.matcher(i).matches()) {
            errors.add(new FieldError("instagram",
                    "Instagram kullanıcı adı yalnızca harf, rakam, alt çizgi ve nokta içerebilir (en fazla 30 karakter)"));
        }
    }

    /** Trim; boş metin → null. */
    public static String blankToNull(String s) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
