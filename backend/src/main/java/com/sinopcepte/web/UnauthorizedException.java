package com.sinopcepte.web;

/**
 * 401. Ör. oturumdaki kullanıcı silinmiş, ya da mevcut şifre yanlış.
 * {@code field} doluysa yanıtta {@code errors:[{field,message}]} de döner.
 */
public class UnauthorizedException extends RuntimeException {

    private final String field;

    public UnauthorizedException(String message) {
        this(null, message);
    }

    public UnauthorizedException(String field, String message) {
        super(message);
        this.field = field;
    }

    public String field() {
        return field;
    }
}
