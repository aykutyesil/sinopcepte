package com.sinopcepte.dolmus;

import java.util.List;

public record DolmusResponse(
        String now,
        String source,
        boolean official,
        String disclaimer,
        String retrievedAt,
        List<DolmusLineDto> lines) {
}
