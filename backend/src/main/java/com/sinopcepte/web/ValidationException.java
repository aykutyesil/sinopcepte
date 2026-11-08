package com.sinopcepte.web;

import java.util.List;

/** 400 + {@code errors} listesi. Tüm hatalı alanlar tek seferde döner. */
public class ValidationException extends RuntimeException {

    private final transient List<FieldError> errors;

    public ValidationException(List<FieldError> errors) {
        super("Doğrulama hatası");
        this.errors = List.copyOf(errors);
    }

    public static ValidationException of(String field, String message) {
        return new ValidationException(List.of(new FieldError(field, message)));
    }

    public List<FieldError> errors() {
        return errors;
    }
}
