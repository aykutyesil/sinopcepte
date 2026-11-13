package com.sinopcepte.confession;

import java.time.OffsetDateTime;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ConfessionCommentDto(
        String id,
        String confessionId,
        String aliasName,
        String aliasAvatar,
        boolean isAnonymous,
        String authorHandle,
        String body,
        OffsetDateTime createdAt,
        String realAuthorHandle) {

    public static ConfessionCommentDto from(ConfessionComment c) {
        return from(c, false);
    }

    public static ConfessionCommentDto from(ConfessionComment c, boolean isAdmin) {
        String handle = c.isAnonymous() ? null : c.getAuthorHandle();
        String realHandle = isAdmin ? c.getAuthorHandle() : null;
        return new ConfessionCommentDto(
                c.getId(),
                c.getConfessionId(),
                c.getAliasName(),
                c.getAliasAvatar(),
                c.isAnonymous(),
                handle,
                c.getBody(),
                c.getCreatedAt(),
                realHandle
        );
    }
}
