package com.sinopcepte.catalog;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Admin paneli CRUD. Yetki SecurityConfig'te: /api/admin/** → ROLE_ADMIN. */
@RestController
@RequestMapping("/api/admin")
public class AdminCatalogController {

    private final CatalogService catalog;

    public AdminCatalogController(CatalogService catalog) {
        this.catalog = catalog;
    }

    @PostMapping("/items")
    public ResponseEntity<ItemDto> createItem(@Validated @RequestBody ItemRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalog.createItem(req));
    }

    @PutMapping("/items/{id}")
    public ItemDto updateItem(@PathVariable String id, @Validated @RequestBody ItemRequest req) {
        return catalog.updateItem(id, req);
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable String id) {
        catalog.deleteItem(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/events")
    public ResponseEntity<EventDto> createEvent(@Validated @RequestBody EventRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalog.createEvent(req));
    }

    @PutMapping("/events/{id}")
    public EventDto updateEvent(@PathVariable String id, @Validated @RequestBody EventRequest req) {
        return catalog.updateEvent(id, req);
    }

    @DeleteMapping("/events/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable String id) {
        catalog.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}
