package com.sinopcepte.confession;

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
@RequestMapping("/api/admin/confessions")
public class AdminConfessionController {

    private final ConfessionService confessionService;
    private final CurrentUser currentUser;

    public AdminConfessionController(ConfessionService confessionService, CurrentUser currentUser) {
        this.confessionService = confessionService;
        this.currentUser = currentUser;
    }

    @GetMapping
    public List<ConfessionDto> listAll() {
        return confessionService.adminListAll();
    }

    @PostMapping("/{id}/toggle-hide")
    public ResponseEntity<Confession> toggleHide(@PathVariable("id") String id) {
        return ResponseEntity.ok(confessionService.adminToggleHide(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") String id, Authentication auth) {
        AppUser admin = currentUser.require(auth);
        confessionService.delete(admin, id);
        return ResponseEntity.noContent().build();
    }
}
