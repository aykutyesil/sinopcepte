package com.sinopcepte.web;

/** Alan bazlı hata: {@code {"field":"handle","message":"Bu rumuz zaten alınmış"}}. Mesajlar Türkçe. */
public record FieldError(String field, String message) {
}
