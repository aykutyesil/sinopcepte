package com.sinopcepte.web;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

/** Tüm hata yanıtlarının ortak JSON şekli: {@code {"status":401,"error":"Unauthorized"}}. */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record ApiError(int status, String error, String message, List<String> details) {

    public static ApiError of(int status, String error) {
        return new ApiError(status, error, null, null);
    }

    public static ApiError of(int status, String error, String message) {
        return new ApiError(status, error, message, null);
    }

    /** Filtre katmanında (Spring MVC dışı) elle yazmak için. */
    public String toJson() {
        StringBuilder sb = new StringBuilder("{\"status\":").append(status)
                .append(",\"error\":\"").append(escape(error)).append('"');
        if (message != null && !message.isEmpty()) {
            sb.append(",\"message\":\"").append(escape(message)).append('"');
        }
        return sb.append('}').toString();
    }

    private static String escape(String s) {
        return s == null ? "" : s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
