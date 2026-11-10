package com.sinopcepte.checkin;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sinopcepte.auth.AppUser;
import com.sinopcepte.auth.CurrentUser;

@RestController
@RequestMapping("/api/checkins")
public class CheckinController {

    public record CheckinRequest(String itemId, String displayName, String avatar, String note, String mood) {}

    private final CheckinService checkinService;
    private final CurrentUser currentUser;

    public CheckinController(CheckinService checkinService, CurrentUser currentUser) {
        this.checkinService = checkinService;
        this.currentUser = currentUser;
    }

    @GetMapping
    public List<VenueCheckin> listAll() {
        return checkinService.listAll();
    }

    @GetMapping("/venue/{itemId}")
    public List<VenueCheckin> listByVenue(@PathVariable("itemId") String itemId) {
        return checkinService.listByVenue(itemId);
    }

    @PostMapping
    public ResponseEntity<VenueCheckin> createCheckin(@RequestBody CheckinRequest req, Authentication auth) {
        AppUser user = currentUser.require(auth);
        VenueCheckin saved = checkinService.checkIn(user, req.itemId(), req.displayName(), req.avatar(), req.note(), req.mood());
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCheckin(@PathVariable("id") String id, Authentication auth) {
        AppUser user = currentUser.require(auth);
        checkinService.deleteCheckin(user, id);
        return ResponseEntity.noContent().build();
    }
}
