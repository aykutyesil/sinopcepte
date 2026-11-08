package com.sinopcepte.pharmacy;

import java.time.Clock;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sinopcepte.web.NotFoundException;

@RestController
@RequestMapping("/api/pharmacy")
public class PharmacyController {

    private final PharmacyService service;
    private final Clock clock;

    public PharmacyController(PharmacyService service, Clock clock) {
        this.service = service;
        this.clock = clock;
    }

    /** Son bilinen nöbetçi eczane; hiç çekilmediyse 404. */
    @GetMapping("/today")
    public ResponseEntity<PharmacyDto> today() {
        return service.latest()
                .map(d -> ResponseEntity.ok(PharmacyDto.from(d, clock.getZone())))
                .orElseThrow(() -> new NotFoundException("Henüz nöbetçi eczane verisi yok"));
    }
}
