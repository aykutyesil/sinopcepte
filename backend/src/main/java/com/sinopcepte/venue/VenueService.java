package com.sinopcepte.venue;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sinopcepte.auth.AppUser;
import com.sinopcepte.auth.AppUserRepository;
import com.sinopcepte.auth.Role;
import com.sinopcepte.catalog.Item;
import com.sinopcepte.catalog.ItemRepository;
import com.sinopcepte.catalog.LiveEvent;
import com.sinopcepte.catalog.LiveEventRepository;
import com.sinopcepte.notification.AppNotification;
import com.sinopcepte.notification.AppNotificationRepository;
import com.sinopcepte.web.BadRequestException;
import com.sinopcepte.web.ForbiddenException;
import com.sinopcepte.web.NotFoundException;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@Service
public class VenueService {

    public record UpdateVenueCmd(
            String desc,
            String phone,
            String wa,
            String rating,
            String mapUrl,
            List<String> photos,
            List<VenueMenuItem> menu
    ) {}

    public record CreateEventCmd(
            String title,
            String date,
            String badge,
            String desc
    ) {}

    private static final JsonMapper MAPPER = JsonMapper.builder().build();

    private final ItemRepository items;
    private final LiveEventRepository events;
    private final VenueClaimRequestRepository claims;
    private final AppUserRepository users;
    private final AppNotificationRepository notifications;
    private final Clock clock;

    public VenueService(ItemRepository items, LiveEventRepository events, VenueClaimRequestRepository claims,
                        AppUserRepository users, AppNotificationRepository notifications, Clock clock) {
        this.items = items;
        this.events = events;
        this.claims = claims;
        this.users = users;
        this.notifications = notifications;
        this.clock = clock;
    }

    public List<VenueProfileDto> listAll() {
        return items.findAllByOrderBySortOrderAscIdAsc().stream()
                .map(this::toDto)
                .toList();
    }

    public VenueProfileDto getVenue(String idOrSlug) {
        Item item = items.findById(idOrSlug)
                .or(() -> items.findAllByOrderBySortOrderAscIdAsc().stream()
                        .filter(i -> VenueSlug.slugify(i.getTitle()).equalsIgnoreCase(idOrSlug))
                        .findFirst())
                .orElseThrow(() -> new NotFoundException("Mekan bulunamadı: " + idOrSlug));
        return toDto(item);
    }

    @Transactional
    public VenueProfileDto updateVenue(AppUser user, String id, UpdateVenueCmd cmd) {
        Item item = items.findById(id)
                .orElseThrow(() -> new NotFoundException("Mekan bulunamadı: " + id));

        boolean isOwner = item.getOwnerHandle() != null && item.getOwnerHandle().equalsIgnoreCase(user.getUsername());
        boolean isAdmin = user.getRole() == Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new ForbiddenException("Bu mekanı düzenleme yetkiniz yok");
        }

        if (cmd.desc() != null) item.setDesc(cmd.desc().trim());
        if (cmd.phone() != null) item.setPhone(cmd.phone().trim());
        if (cmd.wa() != null) item.setWa(cmd.wa().trim());
        if (cmd.rating() != null) item.setRating(cmd.rating().trim());
        if (cmd.mapUrl() != null) item.setMapUrl(cmd.mapUrl().trim());

        if (cmd.photos() != null) {
            try {
                item.setPhotosJson(MAPPER.writeValueAsString(cmd.photos()));
            } catch (Exception ignored) {}
        }

        if (cmd.menu() != null) {
            try {
                item.setMenuJson(MAPPER.writeValueAsString(cmd.menu()));
            } catch (Exception ignored) {}
        }

        return toDto(items.save(item));
    }

    @Transactional
    public VenueClaimRequest claimVenue(AppUser user, String id, String phone, String note) {
        Item item = items.findById(id)
                .orElseThrow(() -> new NotFoundException("Mekan bulunamadı: " + id));

        String claimId = "clm-" + UUID.randomUUID().toString().substring(0, 8);
        OffsetDateTime now = OffsetDateTime.now(clock);

        VenueClaimRequest claim = new VenueClaimRequest(
                claimId, item.getId(), item.getTitle(), user.getUsername(),
                phone != null ? phone.trim() : null,
                note != null ? note.trim() : null,
                now
        );
        return claims.save(claim);
    }

    @Transactional
    public LiveEvent createVenueEvent(AppUser user, String id, CreateEventCmd cmd) {
        Item item = items.findById(id)
                .orElseThrow(() -> new NotFoundException("Mekan bulunamadı: " + id));

        boolean isOwner = item.getOwnerHandle() != null && item.getOwnerHandle().equalsIgnoreCase(user.getUsername());
        boolean isAdmin = user.getRole() == Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new ForbiddenException("Bu mekan için etkinlik oluşturma yetkiniz yok");
        }

        if (cmd.title() == null || cmd.title().isBlank()) {
            throw new BadRequestException("Etkinlik başlığı zorunludur");
        }

        String eventId = "ev-" + UUID.randomUUID().toString().substring(0, 8);
        LiveEvent ev = new LiveEvent(eventId);
        ev.setTitle(cmd.title().trim());
        ev.setVenue(item.getTitle());
        ev.setLocation(item.getLocation());
        ev.setDate(cmd.date() != null ? cmd.date().trim() : "Bu Akşam");
        ev.setBadge(cmd.badge() != null ? cmd.badge().trim() : "Mekan Etkinliği");
        ev.setDesc(cmd.desc() != null ? cmd.desc().trim() : null);
        ev.setWa(item.getWa());
        ev.setSortOrder(events.maxSortOrder() + 1);

        return events.save(ev);
    }

    @Transactional
    public void deleteVenueEvent(AppUser user, String id, String eventId) {
        Item item = items.findById(id)
                .orElseThrow(() -> new NotFoundException("Mekan bulunamadı: " + id));

        boolean isOwner = item.getOwnerHandle() != null && item.getOwnerHandle().equalsIgnoreCase(user.getUsername());
        boolean isAdmin = user.getRole() == Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new ForbiddenException("Bu etkinliği silme yetkiniz yok");
        }

        LiveEvent ev = events.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Etkinlik bulunamadı"));
        events.delete(ev);
    }

    public List<VenueClaimRequest> listClaims() {
        return claims.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public VenueClaimRequest resolveClaim(String claimId, String action) {
        VenueClaimRequest claim = claims.findById(claimId)
                .orElseThrow(() -> new NotFoundException("Talep bulunamadı"));

        OffsetDateTime now = OffsetDateTime.now(clock);

        if ("APPROVE".equalsIgnoreCase(action)) {
            claim.setStatus("APPROVED");
            items.findById(claim.getItemId()).ifPresent(item -> {
                item.setOwnerHandle(claim.getUserHandle());
                items.save(item);
            });

            // Grant badge to user
            users.findByUsername(claim.getUserHandle()).ifPresent(u -> {
                addPatronBadge(u);
                users.save(u);
            });

            // Send notification to user
            String notifId = "n-" + UUID.randomUUID().toString().substring(0, 8);
            AppNotification notif = new AppNotification(
                    notifId, claim.getUserHandle(), "venue_claim_approved",
                    "Mekan Sahipliğiniz Onaylandı! 👑",
                    "\"" + claim.getVenueTitle() + "\" mekanının yetkili patronu oldunuz. Profilinizi düzenleyebilir ve etkinlik ekleyebilirsiniz.",
                    "Az önce", false, "/mekan/" + claim.getItemId(), "Mekanı Yönet", now
            );
            notifications.save(notif);
        } else {
            claim.setStatus("REJECTED");
        }

        return claims.save(claim);
    }

    @Transactional
    public VenueProfileDto setOwner(String itemId, String ownerHandle) {
        Item item = items.findById(itemId)
                .orElseThrow(() -> new NotFoundException("Mekan bulunamadı: " + itemId));

        item.setOwnerHandle(ownerHandle != null && !ownerHandle.isBlank() ? ownerHandle.trim() : null);
        if (ownerHandle != null && !ownerHandle.isBlank()) {
            users.findByUsername(ownerHandle.trim()).ifPresent(u -> {
                addPatronBadge(u);
                users.save(u);
            });
        }
        return toDto(items.save(item));
    }

    private void addPatronBadge(AppUser u) {
        String patronBadge = "👑 Mekan Sahibi (Patron)";
        String current = u.getBadgesJson();
        if (current == null || current.isBlank() || current.trim().equals("[]")) {
            u.setBadgesJson("[\"" + patronBadge + "\"]");
            return;
        }
        try {
            JsonNode node = MAPPER.readTree(current);
            if (node.isArray()) {
                List<String> list = new ArrayList<>();
                node.forEach(i -> list.add(i.asString()));
                if (!list.contains(patronBadge)) {
                    list.add(patronBadge);
                    u.setBadgesJson(MAPPER.writeValueAsString(list));
                }
            }
        } catch (Exception ignored) {}
    }

    public VenueProfileDto toDto(Item item) {
        List<String> photos = new ArrayList<>();
        if (item.getPhotosJson() != null && !item.getPhotosJson().isBlank()) {
            try {
                JsonNode pNode = MAPPER.readTree(item.getPhotosJson());
                if (pNode.isArray()) {
                    pNode.forEach(p -> photos.add(p.asString()));
                }
            } catch (Exception ignored) {}
        }

        List<VenueMenuItem> menu = new ArrayList<>();
        if (item.getMenuJson() != null && !item.getMenuJson().isBlank()) {
            try {
                JsonNode mNode = MAPPER.readTree(item.getMenuJson());
                if (mNode.isArray()) {
                    mNode.forEach(m -> {
                        menu.add(new VenueMenuItem(
                                m.path("category").asString("Genel"),
                                m.path("name").asString(""),
                                m.path("price").asString(""),
                                m.hasNonNull("desc") ? m.path("desc").asString() : null
                        ));
                    });
                }
            } catch (Exception ignored) {}
        }

        return new VenueProfileDto(
                item.getId(),
                VenueSlug.slugify(item.getTitle()),
                item.getTitle(),
                item.getCategory(),
                item.getBadge(),
                item.getLocation(),
                item.getDesc(),
                item.getPhone(),
                item.getWa(),
                item.getRating(),
                item.getMapUrl(),
                item.getOwnerHandle(),
                photos,
                menu
        );
    }
}
