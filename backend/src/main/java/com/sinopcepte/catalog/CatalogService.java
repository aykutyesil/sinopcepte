package com.sinopcepte.catalog;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sinopcepte.pharmacy.PharmacyDuty;
import com.sinopcepte.pharmacy.PharmacyService;
import com.sinopcepte.web.BadRequestException;
import com.sinopcepte.web.ConflictException;
import com.sinopcepte.web.NotFoundException;

@Service
public class CatalogService {

    /** Nöbetçi eczane bilgisinin işlendiği seed kartı (eski sitedeki davranış). */
    public static final String PHARMACY_ITEM_ID = "e-1";

    private final ItemRepository items;
    private final LiveEventRepository events;
    private final PharmacyService pharmacy;

    public CatalogService(ItemRepository items, LiveEventRepository events, PharmacyService pharmacy) {
        this.items = items;
        this.events = events;
        this.pharmacy = pharmacy;
    }

    // ---- Okuma (herkese açık) ----

    @Transactional(readOnly = true)
    public List<ItemDto> listItems(String category) {
        List<Item> list;
        if (category == null || category.isBlank()) {
            list = items.findAllByOrderBySortOrderAscIdAsc();
        } else if (Categories.isValid(category)) {
            list = items.findAllByCategoryOrderBySortOrderAscIdAsc(category);
        } else {
            throw new BadRequestException("Geçersiz kategori: " + category + " (izinli: " + Categories.ALL + ")");
        }
        Optional<PharmacyDuty> duty = pharmacy.latest();
        return list.stream()
                .map(ItemDto::from)
                .map(dto -> duty.filter(d -> PHARMACY_ITEM_ID.equals(dto.id())).map(d -> merge(dto, d)).orElse(dto))
                .toList();
    }

    /** Günün eczanesini e-1 kartına işler; id ve diğer alanlar korunur. */
    static ItemDto merge(ItemDto dto, PharmacyDuty d) {
        String phone = d.getPhoneFormatted() != null ? d.getPhoneFormatted() : dto.phone();
        String wa = d.getPhoneFormatted() != null ? "9" + d.getPhoneFormatted() : dto.wa();
        String mapUrl = d.getMapUrl() != null ? d.getMapUrl() : dto.mapUrl();
        String location = d.getAddress() != null ? "📍 " + d.getAddress() : dto.location();
        return new ItemDto(dto.id(), dto.category(), d.getName() + " (Sinop Merkez Nöbetçi)", dto.badge(),
                location, dto.desc(), phone, wa, dto.rating(), mapUrl);
    }

    @Transactional(readOnly = true)
    public List<EventDto> listEvents() {
        return events.findAllByOrderBySortOrderAscIdAsc().stream().map(EventDto::from).toList();
    }

    // ---- Kartlar (admin) ----

    @Transactional
    public ItemDto createItem(ItemRequest req) {
        String id = req.id() != null && !req.id().isBlank() ? req.id() : newId("item-", items::existsById);
        if (items.existsById(id)) {
            throw new ConflictException("Bu id zaten var: " + id);
        }
        Item item = new Item(id);
        apply(item, req);
        item.setSortOrder(items.maxSortOrder() + 1);
        return ItemDto.from(items.save(item));
    }

    @Transactional
    public ItemDto updateItem(String id, ItemRequest req) {
        Item item = items.findById(id).orElseThrow(() -> new NotFoundException("Kart bulunamadı: " + id));
        apply(item, req);
        return ItemDto.from(items.save(item));
    }

    @Transactional
    public void deleteItem(String id) {
        Item item = items.findById(id).orElseThrow(() -> new NotFoundException("Kart bulunamadı: " + id));
        items.delete(item);
    }

    private static void apply(Item item, ItemRequest req) {
        item.setCategory(req.category());
        item.setTitle(req.title());
        item.setBadge(req.badge());
        item.setLocation(req.location());
        item.setDesc(req.desc());
        item.setPhone(req.phone());
        item.setWa(req.wa());
        item.setRating(req.rating());
        item.setMapUrl(req.mapUrl() == null || req.mapUrl().isBlank() ? null : req.mapUrl());
    }

    // ---- Etkinlikler (admin) ----

    @Transactional
    public EventDto createEvent(EventRequest req) {
        String id = req.id() != null && !req.id().isBlank() ? req.id() : newId("ev-", events::existsById);
        if (events.existsById(id)) {
            throw new ConflictException("Bu id zaten var: " + id);
        }
        LiveEvent ev = new LiveEvent(id);
        apply(ev, req);
        ev.setSortOrder(events.maxSortOrder() + 1);
        return EventDto.from(events.save(ev));
    }

    @Transactional
    public EventDto updateEvent(String id, EventRequest req) {
        LiveEvent ev = events.findById(id).orElseThrow(() -> new NotFoundException("Etkinlik bulunamadı: " + id));
        apply(ev, req);
        return EventDto.from(events.save(ev));
    }

    @Transactional
    public void deleteEvent(String id) {
        LiveEvent ev = events.findById(id).orElseThrow(() -> new NotFoundException("Etkinlik bulunamadı: " + id));
        events.delete(ev);
    }

    private static void apply(LiveEvent ev, EventRequest req) {
        ev.setTitle(req.title());
        ev.setVenue(req.venue());
        ev.setLocation(req.location());
        ev.setDate(req.date());
        ev.setBadge(req.badge());
        ev.setDesc(req.desc());
        ev.setWa(req.wa());
    }

    private static String newId(String prefix, java.util.function.Predicate<String> exists) {
        for (int i = 0; i < 5; i++) {
            String id = prefix + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
            if (!exists.test(id)) {
                return id;
            }
        }
        throw new IllegalStateException("Benzersiz id üretilemedi");
    }
}
