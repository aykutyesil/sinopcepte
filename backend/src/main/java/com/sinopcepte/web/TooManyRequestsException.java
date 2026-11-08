package com.sinopcepte.web;

/** 429 + {@code Retry-After} (saniye). */
public class TooManyRequestsException extends RuntimeException {

    private final long retryAfterSeconds;

    public TooManyRequestsException(long retryAfterSeconds) {
        super("Çok fazla deneme. Lütfen daha sonra tekrar deneyin.");
        this.retryAfterSeconds = Math.max(1, retryAfterSeconds);
    }

    public long retryAfterSeconds() {
        return retryAfterSeconds;
    }
}
