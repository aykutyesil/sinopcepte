package com.sinopcepte.catalog;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class PublicCatalogController {

    private final CatalogService catalog;

    public PublicCatalogController(CatalogService catalog) {
        this.catalog = catalog;
    }

    /** Seed sırasıyla kartlar; isteğe bağlı kategori filtresi (geçersiz kategori → 400). */
    @GetMapping("/items")
    public List<ItemDto> items(@RequestParam(required = false) String category) {
        return catalog.listItems(category);
    }

    @GetMapping("/events")
    public List<EventDto> events() {
        return catalog.listEvents();
    }
}
