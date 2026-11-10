package com.sinopcepte.confession;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sinopcepte.auth.AppUser;
import com.sinopcepte.auth.AppUserRepository;
import com.sinopcepte.auth.Role;
import com.sinopcepte.web.BadRequestException;
import com.sinopcepte.web.ForbiddenException;
import com.sinopcepte.web.NotFoundException;

@Service
public class ConfessionService {

    public record CreateConfessionCmd(
            String body,
            String category,
            String venueId,
            String venueTitle,
            String customAliasTheme
    ) {}

    public record CreateCommentCmd(
            String body,
            Boolean anonymous
    ) {}

    private final ConfessionRepository confessions;
    private final ConfessionReactionRepository reactions;
    private final ConfessionCommentRepository comments;
    private final AppUserRepository users;
    private final Clock clock;

    public ConfessionService(ConfessionRepository confessions, ConfessionReactionRepository reactions,
                             ConfessionCommentRepository comments, AppUserRepository users, Clock clock) {
        this.confessions = confessions;
        this.reactions = reactions;
        this.comments = comments;
        this.users = users;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<ConfessionDto> listConfessions(String sort, String venueId, String category, AppUser currentUser) {
        List<Confession> list;
        if (venueId != null && !venueId.isBlank()) {
            list = confessions.findByHiddenFalseAndVenueIdOrderByCreatedAtDesc(venueId.trim());
        } else if (category != null && !category.isBlank() && !category.equalsIgnoreCase("all")) {
            list = confessions.findByHiddenFalseAndCategoryOrderByCreatedAtDesc(category.trim());
        } else {
            list = confessions.findByHiddenFalseOrderByCreatedAtDesc();
        }

        if ("trending".equalsIgnoreCase(sort)) {
            list = list.stream()
                    .sorted(Comparator.comparingInt((Confession c) -> c.getFireCount() + c.getLaughCount() + c.getShockCount() + c.getHeartCount()).reversed()
                            .thenComparing(Confession::getCreatedAt, Comparator.reverseOrder()))
                    .collect(Collectors.toList());
        }

        String userHandle = currentUser != null ? currentUser.getUsername() : null;
        Set<String> userReactions = userHandle != null
                ? reactions.findByUserHandle(userHandle).stream()
                        .map(r -> r.getConfessionId() + ":" + r.getReactionType())
                        .collect(Collectors.toSet())
                : Set.of();

        return list.stream()
                .map(c -> toDto(c, currentUser, userReactions))
                .toList();
    }

    @Transactional
    public ConfessionDto createConfession(AppUser user, CreateConfessionCmd cmd) {
        if (cmd.body() == null || cmd.body().trim().isBlank()) {
            throw new BadRequestException("İtiraf metni boş olamaz");
        }
        String body = cmd.body().trim();
        if (body.length() > 500) {
            throw new BadRequestException("İtiraf en fazla 500 karakter olabilir");
        }

        String id = "cnf-" + UUID.randomUUID().toString().substring(0, 8);
        SinopAliasGenerator.GeneratedAlias alias = SinopAliasGenerator.generate(cmd.customAliasTheme());
        String cat = (cmd.category() != null && !cmd.category().isBlank()) ? cmd.category().trim().toLowerCase() : "gece";
        OffsetDateTime now = OffsetDateTime.now(clock);

        Confession c = new Confession(
                id, user.getUsername(), alias.name(), alias.avatar(),
                cmd.venueId() != null && !cmd.venueId().isBlank() ? cmd.venueId().trim() : null,
                cmd.venueTitle() != null && !cmd.venueTitle().isBlank() ? cmd.venueTitle().trim() : null,
                cat, body, now
        );

        Confession saved = confessions.save(c);
        return toDto(saved, user, Set.of());
    }

    @Transactional
    public ConfessionDto react(AppUser user, String confessionId, String reactionType) {
        if (reactionType == null || reactionType.isBlank()) {
            throw new BadRequestException("Tepki türü belirtilmelidir");
        }
        String type = reactionType.trim().toUpperCase();
        if (!type.equals("FIRE") && !type.equals("LAUGH") && !type.equals("SHOCK") && !type.equals("HEART")) {
            throw new BadRequestException("Geçersiz tepki türü: " + reactionType);
        }

        Confession c = confessions.findById(confessionId)
                .orElseThrow(() -> new NotFoundException("İtiraf bulunamadı"));

        Optional<ConfessionReaction> existing = reactions.findByConfessionIdAndUserHandleAndReactionType(confessionId, user.getUsername(), type);
        if (existing.isPresent()) {
            reactions.delete(existing.get());
            adjustCount(c, type, -1);
        } else {
            reactions.save(new ConfessionReaction(confessionId, user.getUsername(), type));
            adjustCount(c, type, 1);
        }

        Confession updated = confessions.save(c);
        Set<String> userReactions = reactions.findByConfessionIdAndUserHandle(confessionId, user.getUsername()).stream()
                .map(r -> r.getConfessionId() + ":" + r.getReactionType())
                .collect(Collectors.toSet());

        return toDto(updated, user, userReactions);
    }

    private void adjustCount(Confession c, String type, int delta) {
        switch (type) {
            case "FIRE" -> c.setFireCount(Math.max(0, c.getFireCount() + delta));
            case "LAUGH" -> c.setLaughCount(Math.max(0, c.getLaughCount() + delta));
            case "SHOCK" -> c.setShockCount(Math.max(0, c.getShockCount() + delta));
            case "HEART" -> c.setHeartCount(Math.max(0, c.getHeartCount() + delta));
        }
    }

    @Transactional
    public ConfessionCommentDto addComment(AppUser user, String confessionId, CreateCommentCmd cmd) {
        if (cmd.body() == null || cmd.body().trim().isBlank()) {
            throw new BadRequestException("Yorum metni boş olamaz");
        }
        String body = cmd.body().trim();
        if (body.length() > 300) {
            throw new BadRequestException("Yorum en fazla 300 karakter olabilir");
        }

        Confession c = confessions.findById(confessionId)
                .orElseThrow(() -> new NotFoundException("İtiraf bulunamadı"));

        boolean isAnon = cmd.anonymous() == null || Boolean.TRUE.equals(cmd.anonymous());
        String aliasName;
        String aliasAvatar;

        if (isAnon) {
            SinopAliasGenerator.GeneratedAlias alias = SinopAliasGenerator.generate("Sinop");
            aliasName = alias.name();
            aliasAvatar = alias.avatar();
        } else {
            aliasName = "@" + user.getUsername();
            aliasAvatar = user.getAvatar();
        }

        String commentId = "cmt-" + UUID.randomUUID().toString().substring(0, 8);
        OffsetDateTime now = OffsetDateTime.now(clock);

        ConfessionComment comment = new ConfessionComment(
                commentId, c.getId(), user.getUsername(), aliasName, aliasAvatar, isAnon, body, now
        );

        return ConfessionCommentDto.from(comments.save(comment));
    }

    @Transactional
    public void report(AppUser user, String confessionId) {
        Confession c = confessions.findById(confessionId)
                .orElseThrow(() -> new NotFoundException("İtiraf bulunamadı"));
        c.setReportCount(c.getReportCount() + 1);
        confessions.save(c);
    }

    @Transactional
    public void delete(AppUser user, String confessionId) {
        Confession c = confessions.findById(confessionId)
                .orElseThrow(() -> new NotFoundException("İtiraf bulunamadı"));

        boolean isAuthor = c.getAuthorHandle().equalsIgnoreCase(user.getUsername());
        boolean isAdmin = user.getRole() == Role.ADMIN;
        if (!isAuthor && !isAdmin) {
            throw new ForbiddenException("Bu itirafı silme yetkiniz yok");
        }

        confessions.delete(c);
    }

    // Admin endpoints
    @Transactional(readOnly = true)
    public List<ConfessionDto> adminListAll() {
        return confessions.findAllByOrderByCreatedAtDesc().stream()
                .map(c -> {
                    String authorH = c.getAuthorHandle();
                    AppUser author = authorH != null ? users.findByUsername(authorH).orElse(null) : null;
                    List<ConfessionCommentDto> commentDtos = comments.findByConfessionIdOrderByCreatedAtAsc(c.getId()).stream()
                            .map(cm -> ConfessionCommentDto.from(cm, true))
                            .toList();
                    return new ConfessionDto(
                            c.getId(),
                            c.getAliasName(),
                            c.getAliasAvatar(),
                            c.getVenueId(),
                            c.getVenueTitle(),
                            c.getCategory(),
                            c.getBody(),
                            c.getFireCount(),
                            c.getLaughCount(),
                            c.getShockCount(),
                            c.getHeartCount(),
                            c.getReportCount(),
                            List.of(),
                            false,
                            commentDtos,
                            c.getCreatedAt(),
                            authorH,
                            author != null ? author.getEmail() : null,
                            author != null ? author.getPhone() : null
                    );
                })
                .toList();
    }

    @Transactional
    public Confession adminToggleHide(String confessionId) {
        Confession c = confessions.findById(confessionId)
                .orElseThrow(() -> new NotFoundException("İtiraf bulunamadı"));
        c.setHidden(!c.isHidden());
        return confessions.save(c);
    }

    private ConfessionDto toDto(Confession c, AppUser currentUser, Set<String> userReactionKeys) {
        String userHandle = currentUser != null ? currentUser.getUsername() : null;
        boolean isAdmin = currentUser != null && currentUser.getRole() == Role.ADMIN;

        List<String> myReactions = new ArrayList<>();
        if (userHandle != null) {
            for (String type : List.of("FIRE", "LAUGH", "SHOCK", "HEART")) {
                if (userReactionKeys.contains(c.getId() + ":" + type)) {
                    myReactions.add(type);
                }
            }
        }

        boolean isMine = userHandle != null && c.getAuthorHandle().equalsIgnoreCase(userHandle);

        List<ConfessionCommentDto> commentDtos = comments.findByConfessionIdOrderByCreatedAtAsc(c.getId()).stream()
                .map(cm -> ConfessionCommentDto.from(cm, isAdmin))
                .toList();

        String realAuthorHandle = isAdmin ? c.getAuthorHandle() : null;
        String realAuthorEmail = null;
        String realAuthorPhone = null;
        if (isAdmin && c.getAuthorHandle() != null) {
            AppUser author = users.findByUsername(c.getAuthorHandle()).orElse(null);
            if (author != null) {
                realAuthorEmail = author.getEmail();
                realAuthorPhone = author.getPhone();
            }
        }

        return new ConfessionDto(
                c.getId(),
                c.getAliasName(),
                c.getAliasAvatar(),
                c.getVenueId(),
                c.getVenueTitle(),
                c.getCategory(),
                c.getBody(),
                c.getFireCount(),
                c.getLaughCount(),
                c.getShockCount(),
                c.getHeartCount(),
                c.getReportCount(),
                myReactions,
                isMine,
                commentDtos,
                c.getCreatedAt(),
                realAuthorHandle,
                realAuthorEmail,
                realAuthorPhone
        );
    }
}
