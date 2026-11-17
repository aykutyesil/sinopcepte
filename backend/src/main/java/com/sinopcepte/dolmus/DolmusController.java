package com.sinopcepte.dolmus;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dolmus")
public class DolmusController {

    private final DolmusService service;

    public DolmusController(DolmusService service) {
        this.service = service;
    }

    /** Tüm hatlar + her biri için şimdiden sonraki 3 sefer. */
    @GetMapping
    public DolmusResponse all() {
        return service.snapshot();
    }
}
