package com.sinopcepte.confession;

import java.time.OffsetDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ConfessionDto(
        String id,
        String aliasName,
        String aliasAvatar,
        String venueId,
        String venueTitle,
        String category,
        String body,
        int fireCount,
        int laughCount,
        int shockCount,
        int heartCount,
        int reportCount,
        List<String> myReactions,
        boolean isMine,
        List<ConfessionCommentDto> comments,
        OffsetDateTime createdAt,
        String realAuthorHandle,
        String realAuthorEmail,
        String realAuthorPhone) {
}
