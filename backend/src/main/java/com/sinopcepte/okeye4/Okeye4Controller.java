package com.sinopcepte.okeye4;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sinopcepte.auth.AppUser;
import com.sinopcepte.auth.CurrentUser;

@RestController
@RequestMapping("/api/okeye4")
public class Okeye4Controller {

    public record ApplyRequest(String phone, String note) {}
    public record ResolveRequest(String action) {}

    private final Okeye4Service okeye4Service;
    private final CurrentUser currentUser;

    public Okeye4Controller(Okeye4Service okeye4Service, CurrentUser currentUser) {
        this.okeye4Service = okeye4Service;
        this.currentUser = currentUser;
    }

    @GetMapping("/lobbies")
    public List<Okeye4Service.LobbyWithRequests> listLobbies() {
        return okeye4Service.listAll();
    }

    @GetMapping("/lobbies/{id}")
    public Okeye4Service.LobbyWithRequests getLobby(@PathVariable("id") String id) {
        return okeye4Service.getLobby(id);
    }

    @PostMapping("/lobbies")
    public ResponseEntity<Okeye4Lobby> createLobby(@RequestBody Okeye4Service.CreateLobbyCmd cmd, Authentication auth) {
        AppUser user = currentUser.require(auth);
        Okeye4Lobby lobby = okeye4Service.createLobby(user, cmd);
        return ResponseEntity.ok(lobby);
    }

    @PostMapping("/lobbies/{id}/apply")
    public ResponseEntity<Okeye4JoinRequest> apply(@PathVariable("id") String id, @RequestBody ApplyRequest req, Authentication auth) {
        AppUser user = currentUser.require(auth);
        Okeye4JoinRequest saved = okeye4Service.apply(user, id, req.phone(), req.note());
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/lobbies/{id}/requests/{requestId}")
    public ResponseEntity<Okeye4JoinRequest> resolve(@PathVariable("id") String id,
                                                     @PathVariable("requestId") String requestId,
                                                     @RequestBody ResolveRequest req,
                                                     Authentication auth) {
        AppUser user = currentUser.require(auth);
        Okeye4JoinRequest resolved = okeye4Service.resolveRequest(user, id, requestId, req.action());
        return ResponseEntity.ok(resolved);
    }

    @PostMapping("/lobbies/{id}/close")
    public ResponseEntity<Okeye4Lobby> close(@PathVariable("id") String id, Authentication auth) {
        AppUser user = currentUser.require(auth);
        Okeye4Lobby closed = okeye4Service.closeLobby(user, id);
        return ResponseEntity.ok(closed);
    }
}
