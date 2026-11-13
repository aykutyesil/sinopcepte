package com.sinopcepte.confession;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sinopcepte.auth.AppUser;
import com.sinopcepte.auth.CurrentUser;

@RestController
@RequestMapping("/api/confessions")
public class ConfessionController {

    public record ReactRequest(String type) {}

    private final ConfessionService confessionService;
    private final CurrentUser currentUser;

    public ConfessionController(ConfessionService confessionService, CurrentUser currentUser) {
        this.confessionService = confessionService;
        this.currentUser = currentUser;
    }

    @GetMapping
    public List<ConfessionDto> list(
            @RequestParam(name = "sort", required = false, defaultValue = "new") String sort,
            @RequestParam(name = "venueId", required = false) String venueId,
            @RequestParam(name = "category", required = false) String category,
            Authentication auth) {
        AppUser user = currentUser.find(auth).orElse(null);
        return confessionService.listConfessions(sort, venueId, category, user);
    }

    @PostMapping
    public ResponseEntity<ConfessionDto> create(@RequestBody ConfessionService.CreateConfessionCmd cmd, Authentication auth) {
        AppUser user = currentUser.require(auth);
        return ResponseEntity.ok(confessionService.createConfession(user, cmd));
    }

    @PostMapping("/{id}/react")
    public ResponseEntity<ConfessionDto> react(@PathVariable("id") String id, @RequestBody ReactRequest req, Authentication auth) {
        AppUser user = currentUser.require(auth);
        return ResponseEntity.ok(confessionService.react(user, id, req.type()));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ConfessionCommentDto> addComment(
            @PathVariable("id") String id,
            @RequestBody ConfessionService.CreateCommentCmd cmd,
            Authentication auth) {
        AppUser user = currentUser.require(auth);
        return ResponseEntity.ok(confessionService.addComment(user, id, cmd));
    }

    @PostMapping("/{id}/report")
    public ResponseEntity<Void> report(@PathVariable("id") String id, Authentication auth) {
        AppUser user = currentUser.require(auth);
        confessionService.report(user, id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") String id, Authentication auth) {
        AppUser user = currentUser.require(auth);
        confessionService.delete(user, id);
        return ResponseEntity.noContent().build();
    }
}
