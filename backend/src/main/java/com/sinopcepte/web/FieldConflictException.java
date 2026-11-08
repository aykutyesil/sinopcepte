package com.sinopcepte.web;

/** 409; hangi alanın çakıştığını {@code errors[0].field} ile söyler. */
public class FieldConflictException extends RuntimeException {

    private final String field;

    public FieldConflictException(String field, String message) {
        super(message);
        this.field = field;
    }

    public String field() {
        return field;
    }
}
