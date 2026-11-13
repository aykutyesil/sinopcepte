package com.sinopcepte.taxi;

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
@RequestMapping("/api/taxi/lobbies")
public class TaxiLobbyController {

    public record JoinLobbyCmd(String phone) {}

    private final TaxiLobbyService taxiLobbyService;
    private final CurrentUser currentUser;

    public TaxiLobbyController(TaxiLobbyService taxiLobbyService, CurrentUser currentUser) {
        this.taxiLobbyService = taxiLobbyService;
        this.currentUser = currentUser;
    }

    @GetMapping
    public List<TaxiLobbyDto> list(
            @RequestParam(name = "destination", required = false) String destination,
            @RequestParam(name = "status", required = false) String status,
            Authentication auth
    ) {
        AppUser user = currentUser.find(auth).orElse(null);
        return taxiLobbyService.listLobbies(destination, status, user);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaxiLobbyDto> get(@PathVariable("id") String id, Authentication auth) {
        AppUser user = currentUser.find(auth).orElse(null);
        return ResponseEntity.ok(taxiLobbyService.getLobby(id, user));
    }

    @PostMapping
    public ResponseEntity<TaxiLobbyDto> create(
            @RequestBody TaxiLobbyService.CreateTaxiLobbyCmd cmd,
            Authentication auth
    ) {
        AppUser user = currentUser.require(auth);
        return ResponseEntity.ok(taxiLobbyService.createLobby(user, cmd));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<TaxiLobbyDto> join(
            @PathVariable("id") String id,
            @RequestBody(required = false) JoinLobbyCmd cmd,
            Authentication auth
    ) {
        AppUser user = currentUser.require(auth);
        String phone = cmd != null ? cmd.phone() : null;
        return ResponseEntity.ok(taxiLobbyService.joinLobby(user, id, phone));
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<TaxiLobbyDto> leave(
            @PathVariable("id") String id,
            Authentication auth
    ) {
        AppUser user = currentUser.require(auth);
        return ResponseEntity.ok(taxiLobbyService.leaveLobby(user, id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(
            @PathVariable("id") String id,
            Authentication auth
    ) {
        AppUser user = currentUser.require(auth);
        taxiLobbyService.cancelLobby(user, id);
        return ResponseEntity.noContent().build();
    }
}
