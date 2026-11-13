package com.sinopcepte.pharmacy;

/** Kaynak sayfanın yapısı beklenenden farklıysa fırlatılır. */
public class PharmacyParseException extends RuntimeException {

    public PharmacyParseException(String message) {
        super(message);
    }
}
