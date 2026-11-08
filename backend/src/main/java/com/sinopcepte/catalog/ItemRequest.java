package com.sinopcepte.catalog;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Admin kart oluşturma/güncelleme gövdesi. {@code id} yalnız POST'ta dikkate alınır ve isteğe bağlıdır;
 * verilmezse sunucu {@code item-xxxxxxxx} üretir. PUT'ta yol parametresi esastır.
 */
public record ItemRequest(
        @Pattern(regexp = "[a-z0-9][a-z0-9-]{0,63}", message = "id yalnız küçük harf, rakam ve tire içerebilir")
        String id,
        @NotBlank
        @Pattern(regexp = Categories.REGEX, message = "category şunlardan biri olmalı: mekan, tekel, taksi, eczane, cicek")
        String category,
        @NotBlank @Size(max = 200) String title,
        @Size(max = 200) String badge,
        @Size(max = 300) String location,
        @Size(max = 5000) String desc,
        @Size(max = 32) String phone,
        @Size(max = 32) String wa,
        @Size(max = 8) String rating,
        @Size(max = 1000) String mapUrl) {
}
