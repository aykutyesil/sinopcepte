package com.sinopcepte.notification;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sinopcepte.auth.AppUser;
import com.sinopcepte.auth.CurrentUser;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUser currentUser;

    public NotificationController(NotificationService notificationService, CurrentUser currentUser) {
        this.notificationService = notificationService;
        this.currentUser = currentUser;
    }

    @GetMapping
    public List<AppNotification> list(Authentication auth) {
        AppUser user = currentUser.require(auth);
        return notificationService.listForUser(user);
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<AppNotification> markRead(@PathVariable("id") String id, Authentication auth) {
        AppUser user = currentUser.require(auth);
        return ResponseEntity.ok(notificationService.markAsRead(user, id));
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllRead(Authentication auth) {
        AppUser user = currentUser.require(auth);
        notificationService.markAllRead(user);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") String id, Authentication auth) {
        AppUser user = currentUser.require(auth);
        notificationService.delete(user, id);
        return ResponseEntity.noContent().build();
    }
}
