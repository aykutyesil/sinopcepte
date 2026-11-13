package com.sinopcepte.venue;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sinopcepte.auth.AppUser;
import com.sinopcepte.auth.CurrentUser;
import com.sinopcepte.catalog.LiveEvent;

@RestController
@RequestMapping("/api/venues")
public class VenueController {

    public record ClaimRequest(String phone, String note) {}

    private final VenueService venueService;
    private final CurrentUser currentUser;

    public VenueController(VenueService venueService, CurrentUser currentUser) {
        this.venueService = venueService;
        this.currentUser = currentUser;
    }

    @GetMapping
    public List<VenueProfileDto> listAll() {
        return venueService.listAll();
    }

    @GetMapping("/{id}")
    public VenueProfileDto getVenue(@PathVariable("id") String id) {
        return venueService.getVenue(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VenueProfileDto> updateVenue(@PathVariable("id") String id,
                                                       @RequestBody VenueService.UpdateVenueCmd cmd,
                                                       Authentication auth) {
        AppUser user = currentUser.require(auth);
        return ResponseEntity.ok(venueService.updateVenue(user, id, cmd));
    }

    @PostMapping("/{id}/claims")
    public ResponseEntity<VenueClaimRequest> claimVenue(@PathVariable("id") String id,
                                                        @RequestBody ClaimRequest req,
                                                        Authentication auth) {
        AppUser user = currentUser.require(auth);
        return ResponseEntity.ok(venueService.claimVenue(user, id, req.phone(), req.note()));
    }

    @PostMapping("/{id}/events")
    public ResponseEntity<LiveEvent> createVenueEvent(@PathVariable("id") String id,
                                                      @RequestBody VenueService.CreateEventCmd cmd,
                                                      Authentication auth) {
        AppUser user = currentUser.require(auth);
        return ResponseEntity.ok(venueService.createVenueEvent(user, id, cmd));
    }

    @DeleteMapping("/{id}/events/{eventId}")
    public ResponseEntity<Void> deleteVenueEvent(@PathVariable("id") String id,
                                                 @PathVariable("eventId") String eventId,
                                                 Authentication auth) {
        AppUser user = currentUser.require(auth);
        venueService.deleteVenueEvent(user, id, eventId);
        return ResponseEntity.noContent().build();
    }
}
