package com.sinopcepte.okeye4;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sinopcepte.auth.AppUser;
import com.sinopcepte.notification.AppNotification;
import com.sinopcepte.notification.AppNotificationRepository;
import com.sinopcepte.web.BadRequestException;
import com.sinopcepte.web.ForbiddenException;
import com.sinopcepte.web.NotFoundException;

@Service
public class Okeye4Service {

    public record CreateLobbyCmd(
            String category,
            String title,
            String venue,
            String district,
            Integer maxPlayers,
            String startTime,
            String expiresIn,
            String hostPhone,
            String hostWa,
            String note
    ) {}

    public record LobbyWithRequests(
            Okeye4Lobby lobby,
            List<Okeye4JoinRequest> requests
    ) {}

    private final Okeye4LobbyRepository lobbies;
    private final Okeye4JoinRequestRepository requests;
    private final AppNotificationRepository notifications;
    private final Clock clock;

    public Okeye4Service(Okeye4LobbyRepository lobbies, Okeye4JoinRequestRepository requests,
                         AppNotificationRepository notifications, Clock clock) {
        this.lobbies = lobbies;
        this.requests = requests;
        this.notifications = notifications;
        this.clock = clock;
    }

    public List<LobbyWithRequests> listAll() {
        List<Okeye4Lobby> allLobbies = lobbies.findAllByOrderByCreatedAtDesc();
        return allLobbies.stream()
                .map(l -> new LobbyWithRequests(l, requests.findByLobbyIdOrderByCreatedAtAsc(l.getId())))
                .toList();
    }

    public LobbyWithRequests getLobby(String id) {
        Okeye4Lobby lobby = lobbies.findById(id)
                .orElseThrow(() -> new NotFoundException("Masa bulunamadı"));
        return new LobbyWithRequests(lobby, requests.findByLobbyIdOrderByCreatedAtAsc(id));
    }

    @Transactional
    public Okeye4Lobby createLobby(AppUser user, CreateLobbyCmd cmd) {
        if (cmd.title() == null || cmd.title().isBlank()) throw new BadRequestException("Başlık zorunludur");
        if (cmd.venue() == null || cmd.venue().isBlank()) throw new BadRequestException("Mekan zorunludur");

        String id = "l-" + UUID.randomUUID().toString().substring(0, 8);
        int max = (cmd.maxPlayers() != null && cmd.maxPlayers() > 1) ? cmd.maxPlayers() : 4;
        String cat = (cmd.category() != null && !cmd.category().isBlank()) ? cmd.category().trim() : "okey";
        String dist = (cmd.district() != null && !cmd.district().isBlank()) ? cmd.district().trim() : "Merkez";
        String start = (cmd.startTime() != null && !cmd.startTime().isBlank()) ? cmd.startTime().trim() : "19:00";
        String exp = (cmd.expiresIn() != null && !cmd.expiresIn().isBlank()) ? cmd.expiresIn().trim() : "2 saat sonra";
        OffsetDateTime now = OffsetDateTime.now(clock);

        Okeye4Lobby lobby = new Okeye4Lobby(
                id, cat, cmd.title().trim(), cmd.venue().trim(), dist,
                1, max, start, exp,
                user.getUsername(), user.getUsername(), user.getAvatar(),
                95, "Sinoplu Üye", cmd.hostPhone(), cmd.hostWa(),
                cmd.note(), "OPEN", now
        );
        return lobbies.save(lobby);
    }

    @Transactional
    public Okeye4JoinRequest apply(AppUser user, String lobbyId, String phone, String note) {
        Okeye4Lobby lobby = lobbies.findById(lobbyId)
                .orElseThrow(() -> new NotFoundException("Masa bulunamadı"));

        if (!"OPEN".equalsIgnoreCase(lobby.getStatus())) {
            throw new BadRequestException("Bu masa artık yeni katılımcı kabul etmiyor");
        }

        if (lobby.getHostHandle().equalsIgnoreCase(user.getUsername())) {
            throw new BadRequestException("Kendi açtığınız masaya başvuru yapamazsınız");
        }

        String reqId = "req-" + UUID.randomUUID().toString().substring(0, 8);
        OffsetDateTime now = OffsetDateTime.now(clock);

        Okeye4JoinRequest req = new Okeye4JoinRequest(
                reqId, lobbyId, user.getUsername(), user.getUsername(), user.getAvatar(),
                95, phone, note, "PENDING", now
        );
        Okeye4JoinRequest saved = requests.save(req);

        // Notify host
        String notifId = "n-" + UUID.randomUUID().toString().substring(0, 8);
        AppNotification notif = new AppNotification(
                notifId, lobby.getHostHandle(), "okeye4_request",
                "Yeni Masa Katılım Başvurusu!",
                "@" + user.getUsername() + ", \"" + lobby.getTitle() + "\" masana katılmak istiyor.",
                "Az önce", false, "/okeye4", "Başvuruyu İncele", now
        );
        notifications.save(notif);

        return saved;
    }

    @Transactional
    public Okeye4JoinRequest resolveRequest(AppUser user, String lobbyId, String requestId, String action) {
        Okeye4Lobby lobby = lobbies.findById(lobbyId)
                .orElseThrow(() -> new NotFoundException("Masa bulunamadı"));

        boolean isHost = lobby.getHostHandle().equalsIgnoreCase(user.getUsername());
        boolean isAdmin = user.getRole() == com.sinopcepte.auth.Role.ADMIN;
        if (!isHost && !isAdmin) {
            throw new ForbiddenException("Yalnız masa kurucusu veya yönetici başvuruyu yanıtlayabilir");
        }

        Okeye4JoinRequest req = requests.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Başvuru bulunamadı"));

        OffsetDateTime now = OffsetDateTime.now(clock);

        if ("APPROVE".equalsIgnoreCase(action)) {
            req.setStatus("APPROVED");
            lobby.setCurrentPlayers(lobby.getCurrentPlayers() + 1);
            if (lobby.getCurrentPlayers() >= lobby.getMaxPlayers()) {
                lobby.setStatus("FULL");
            }
            lobbies.save(lobby);

            // Notify applicant
            String notifId = "n-" + UUID.randomUUID().toString().substring(0, 8);
            AppNotification notif = new AppNotification(
                    notifId, req.getApplicantHandle(), "okeye4_approved",
                    "Masa Başvurun Onaylandı! 🎉",
                    "@" + lobby.getHostHandle() + " seni \"" + lobby.getTitle() + "\" masasına kabul etti.",
                    "Az önce", false, "/okeye4", "Masayı Gör", now
            );
            notifications.save(notif);
        } else {
            req.setStatus("REJECTED");
        }

        return requests.save(req);
    }

    @Transactional
    public Okeye4Lobby closeLobby(AppUser user, String lobbyId) {
        Okeye4Lobby lobby = lobbies.findById(lobbyId)
                .orElseThrow(() -> new NotFoundException("Masa bulunamadı"));

        boolean isHost = lobby.getHostHandle().equalsIgnoreCase(user.getUsername());
        boolean isAdmin = user.getRole() == com.sinopcepte.auth.Role.ADMIN;
        if (!isHost && !isAdmin) {
            throw new ForbiddenException("Yalnız masa kurucusu veya yönetici masayı kapatabilir");
        }

        lobby.setStatus("CLOSED");
        return lobbies.save(lobby);
    }
}
