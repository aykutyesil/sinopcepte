package com.sinopcepte.catalog;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Admin etkinlik gövdesi. {@code id} verilmezse sunucu {@code ev-xxxxxxxx} üretir. */
public record EventRequest(
        @Pattern(regexp = "[a-z0-9][a-z0-9-]{0,63}", message = "id yalnız küçük harf, rakam ve tire içerebilir")
        String id,
        @NotBlank @Size(max = 200) String title,
        @Size(max = 200) String venue,
        @Size(max = 300) String location,
        @Size(max = 100) String date,
        @Size(max = 200) String badge,
        @Size(max = 5000) String desc,
        @Size(max = 32) String wa) {
}
