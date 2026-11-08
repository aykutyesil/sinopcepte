package com.sinopcepte.web;

/** 403 — oturum var ama işlem bu kullanıcıya kapalı (ör. ADMIN kendi hesabını silemez). */
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }
}
