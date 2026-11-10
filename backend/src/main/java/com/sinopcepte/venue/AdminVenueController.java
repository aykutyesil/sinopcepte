package com.sinopcepte.venue;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminVenueController {

    public record ResolveClaimRequest(String action) {}
    public record SetOwnerRequest(String ownerHandle) {}

    private final VenueService venueService;

    public AdminVenueController(VenueService venueService) {
        this.venueService = venueService;
    }

    @GetMapping("/venue-claims")
    public List<VenueClaimRequest> listClaims() {
        return venueService.listClaims();
    }

    @PostMapping("/venue-claims/{id}/resolve")
    public ResponseEntity<VenueClaimRequest> resolveClaim(@PathVariable("id") String id,
                                                          @RequestBody ResolveClaimRequest req) {
        return ResponseEntity.ok(venueService.resolveClaim(id, req.action()));
    }

    @PostMapping("/venues/{id}/owner")
    public ResponseEntity<VenueProfileDto> setOwner(@PathVariable("id") String id,
                                                    @RequestBody SetOwnerRequest req) {
        return ResponseEntity.ok(venueService.setOwner(id, req.ownerHandle()));
    }
}
