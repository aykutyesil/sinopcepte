package com.sinopcepte.taxi;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sinopcepte.auth.AppUser;
import com.sinopcepte.auth.Role;
import com.sinopcepte.notification.AppNotification;
import com.sinopcepte.notification.AppNotificationRepository;
import com.sinopcepte.web.BadRequestException;
import com.sinopcepte.web.ForbiddenException;
import com.sinopcepte.web.NotFoundException;

import jakarta.annotation.PostConstruct;

@Service
public class TaxiLobbyService {

    public record CreateTaxiLobbyCmd(
        String destination,
        String departurePoint,
        String departureTime,
        Integer totalSeats,
        String estimatedFare,
        String note,
        String phone
    ) {}

    private final TaxiLobbyRepository lobbyRepo;
    private final TaxiLobbyMemberRepository memberRepo;
    private final AppNotificationRepository notifRepo;
    private final Clock clock;

    public TaxiLobbyService(TaxiLobbyRepository lobbyRepo,
                            TaxiLobbyMemberRepository memberRepo,
                            AppNotificationRepository notifRepo,
                            Clock clock) {
        this.lobbyRepo = lobbyRepo;
        this.memberRepo = memberRepo;
        this.notifRepo = notifRepo;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<TaxiLobbyDto> listLobbies(String destination, String status, AppUser user) {
        String cleanDest = (destination != null && !destination.isBlank() && !destination.equalsIgnoreCase("all"))
                ? destination.trim().toLowerCase() : null;
        String cleanStatus = (status != null && !status.isBlank() && !status.equalsIgnoreCase("all"))
                ? status.trim().toUpperCase() : null;

        List<TaxiLobby> lobbies = (cleanDest == null && cleanStatus == null)
                ? lobbyRepo.findAllByOrderByCreatedAtDesc()
                : lobbyRepo.searchLobbies(cleanDest, cleanStatus);

        String currentHandle = user != null ? user.getUsername() : null;

        return lobbies.stream().map(lobby -> {
            List<TaxiLobbyMember> members = memberRepo.findByLobbyIdOrderByJoinedAtAsc(lobby.getId());
            boolean joinedByMe = currentHandle != null && members.stream().anyMatch(m -> m.getUserHandle().equalsIgnoreCase(currentHandle));
            boolean isHost = currentHandle != null && lobby.getHostHandle().equalsIgnoreCase(currentHandle);
            return TaxiLobbyDto.fromEntity(lobby, members, joinedByMe, isHost);
        }).toList();
    }

    @Transactional(readOnly = true)
    public TaxiLobbyDto getLobby(String id, AppUser user) {
        TaxiLobby lobby = lobbyRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("Taksi lobisi bulunamadı"));
        List<TaxiLobbyMember> members = memberRepo.findByLobbyIdOrderByJoinedAtAsc(lobby.getId());
        String currentHandle = user != null ? user.getUsername() : null;
        boolean joinedByMe = currentHandle != null && members.stream().anyMatch(m -> m.getUserHandle().equalsIgnoreCase(currentHandle));
        boolean isHost = currentHandle != null && lobby.getHostHandle().equalsIgnoreCase(currentHandle);
        return TaxiLobbyDto.fromEntity(lobby, members, joinedByMe, isHost);
    }

    @Transactional
    public TaxiLobbyDto createLobby(AppUser user, CreateTaxiLobbyCmd cmd) {
        if (cmd.destination() == null || cmd.destination().isBlank()) {
            throw new BadRequestException("Varış yeri (hedef) zorunludur");
        }
        if (cmd.departurePoint() == null || cmd.departurePoint().isBlank()) {
            throw new BadRequestException("Kalkış noktası zorunludur");
        }
        if (cmd.departureTime() == null || cmd.departureTime().isBlank()) {
            throw new BadRequestException("Kalkış saati zorunludur");
        }

        int totalSeats = (cmd.totalSeats() != null && cmd.totalSeats() >= 2 && cmd.totalSeats() <= 8)
                ? cmd.totalSeats() : 4;

        String lobbyId = "tl-" + UUID.randomUUID().toString().substring(0, 8);
        String phone = cmd.phone() != null && !cmd.phone().isBlank() ? cmd.phone().trim() : user.getPhone();
        String hostName = user.getUsername().substring(0, 1).toUpperCase() + user.getUsername().substring(1);
        OffsetDateTime now = OffsetDateTime.now(clock);

        TaxiLobby lobby = new TaxiLobby(
                lobbyId,
                user.getUsername(),
                hostName,
                user.getAvatar() != null ? user.getAvatar() : "marti",
                phone,
                cmd.destination().trim(),
                cmd.departurePoint().trim(),
                cmd.departureTime().trim(),
                totalSeats,
                1,
                cmd.estimatedFare() != null && !cmd.estimatedFare().isBlank() ? cmd.estimatedFare().trim() : null,
                cmd.note() != null && !cmd.note().isBlank() ? cmd.note().trim() : null,
                "OPEN",
                now
        );

        lobbyRepo.save(lobby);

        // Host is the 1st member
        TaxiLobbyMember hostMember = new TaxiLobbyMember(
                lobbyId,
                user.getUsername(),
                hostName,
                user.getAvatar() != null ? user.getAvatar() : "marti",
                phone,
                now
        );
        memberRepo.save(hostMember);

        return TaxiLobbyDto.fromEntity(lobby, List.of(hostMember), true, true);
    }

    @Transactional
    public TaxiLobbyDto joinLobby(AppUser user, String lobbyId, String phone) {
        TaxiLobby lobby = lobbyRepo.findById(lobbyId)
                .orElseThrow(() -> new NotFoundException("Taksi lobisi bulunamadı"));

        if (!"OPEN".equalsIgnoreCase(lobby.getStatus())) {
            throw new BadRequestException("Bu lobi yeni katılımcılara kapalı");
        }

        if (memberRepo.existsByLobbyIdAndUserHandle(lobbyId, user.getUsername())) {
            throw new BadRequestException("Bu lobiye zaten katıldınız");
        }

        List<TaxiLobbyMember> existingMembers = memberRepo.findByLobbyIdOrderByJoinedAtAsc(lobbyId);
        if (existingMembers.size() >= lobby.getTotalSeats()) {
            lobby.setStatus("FULL");
            lobbyRepo.save(lobby);
            throw new BadRequestException("Bu taksi lobisi tamamen doldu");
        }

        String memberPhone = phone != null && !phone.isBlank() ? phone.trim() : user.getPhone();
        String memberName = user.getUsername().substring(0, 1).toUpperCase() + user.getUsername().substring(1);
        OffsetDateTime now = OffsetDateTime.now(clock);

        TaxiLobbyMember newMember = new TaxiLobbyMember(
                lobbyId,
                user.getUsername(),
                memberName,
                user.getAvatar() != null ? user.getAvatar() : "student",
                memberPhone,
                now
        );
        memberRepo.save(newMember);

        int newOccupied = existingMembers.size() + 1;
        lobby.setOccupiedSeats(newOccupied);
        if (newOccupied >= lobby.getTotalSeats()) {
            lobby.setStatus("FULL");
        }
        lobbyRepo.save(lobby);

        // Notify lobby host
        if (!lobby.getHostHandle().equalsIgnoreCase(user.getUsername())) {
            String notifId = "n-" + UUID.randomUUID().toString().substring(0, 8);
            AppNotification notif = new AppNotification(
                    notifId,
                    lobby.getHostHandle(),
                    "taxi_joined",
                    "Yeni Yolcu Katıldı! 🚖",
                    "@" + user.getUsername() + ", \"" + lobby.getDestination() + "\" taksi lobine katıldı. (" + newOccupied + "/" + lobby.getTotalSeats() + ")",
                    "Az önce",
                    false,
                    "/taksi",
                    "Lobiyi Gör",
                    now
            );
            notifRepo.save(notif);
        }

        List<TaxiLobbyMember> updatedMembers = memberRepo.findByLobbyIdOrderByJoinedAtAsc(lobbyId);
        return TaxiLobbyDto.fromEntity(lobby, updatedMembers, true, lobby.getHostHandle().equalsIgnoreCase(user.getUsername()));
    }

    @Transactional
    public TaxiLobbyDto leaveLobby(AppUser user, String lobbyId) {
        TaxiLobby lobby = lobbyRepo.findById(lobbyId)
                .orElseThrow(() -> new NotFoundException("Taksi lobisi bulunamadı"));

        if (lobby.getHostHandle().equalsIgnoreCase(user.getUsername())) {
            throw new BadRequestException("Lobi kurucusu lobiden ayrılamaz; lobi iptal edilebilir.");
        }

        if (!memberRepo.existsByLobbyIdAndUserHandle(lobbyId, user.getUsername())) {
            throw new BadRequestException("Bu lobinin katılımcısı değilsiniz");
        }

        memberRepo.deleteByLobbyIdAndUserHandle(lobbyId, user.getUsername());

        List<TaxiLobbyMember> remaining = memberRepo.findByLobbyIdOrderByJoinedAtAsc(lobbyId);
        lobby.setOccupiedSeats(remaining.size());
        if ("FULL".equalsIgnoreCase(lobby.getStatus()) && remaining.size() < lobby.getTotalSeats()) {
            lobby.setStatus("OPEN");
        }
        lobbyRepo.save(lobby);

        // Notify host
        String notifId = "n-" + UUID.randomUUID().toString().substring(0, 8);
        AppNotification notif = new AppNotification(
                notifId,
                lobby.getHostHandle(),
                "taxi_left",
                "Yolcu Ayrıldı 🚕",
                "@" + user.getUsername() + ", \"" + lobby.getDestination() + "\" taksi lobisinden ayrıldı.",
                "Az önce",
                false,
                "/taksi",
                "Lobiyi Gör",
                OffsetDateTime.now(clock)
        );
        notifRepo.save(notif);

        return TaxiLobbyDto.fromEntity(lobby, remaining, false, false);
    }

    @Transactional
    public void cancelLobby(AppUser user, String lobbyId) {
        TaxiLobby lobby = lobbyRepo.findById(lobbyId)
                .orElseThrow(() -> new NotFoundException("Taksi lobisi bulunamadı"));

        boolean isHost = lobby.getHostHandle().equalsIgnoreCase(user.getUsername());
        boolean isAdmin = user.getRole() == Role.ADMIN;
        if (!isHost && !isAdmin) {
            throw new ForbiddenException("Yalnızca lobi kurucusu veya yönetici lobiyi iptal edebilir");
        }

        lobby.setStatus("COMPLETED");
        lobbyRepo.save(lobby);
    }

    @PostConstruct
    public void initSeedData() {
        if (lobbyRepo.count() > 0) {
            return;
        }

        OffsetDateTime now = OffsetDateTime.now(clock);

        // 1. Sinop Havalimanı Uçak Karşılama
        TaxiLobby l1 = new TaxiLobby(
                "tl-seed-1",
                "aykut",
                "Aykut Şen",
                "crown",
                "0542 555 11 22",
                "Sinop Havalimanı (SNU)",
                "Sinop Valilik Önü / Meydan",
                "Bugün 18:15",
                4,
                2,
                "420 ₺ (Kişi başı ~105 ₺)",
                "19:40 İstanbul THY uçağına gidiyoruz. Bagaj yeri var, masrafı 4'e bölüyoruz.",
                "OPEN",
                now.minusMinutes(45)
        );
        lobbyRepo.save(l1);
        memberRepo.save(new TaxiLobbyMember(l1.getId(), "aykut", "Aykut Şen", "crown", "0542 555 11 22", now.minusMinutes(45)));
        memberRepo.save(new TaxiLobbyMember(l1.getId(), "sinem", "Sinem Kaya", "marti", "0533 111 22 33", now.minusMinutes(20)));

        // 2. SNÜ Kampüs - Otogar
        TaxiLobby l2 = new TaxiLobby(
                "tl-seed-2",
                "deniz_kaya",
                "Deniz Kaya",
                "student",
                "0555 444 33 22",
                "Sinop Otogarı",
                "SNÜ Merkez Kampüs (KYK Önü)",
                "Cuma 16:30",
                4,
                3,
                "280 ₺ (Kişi başı ~70 ₺)",
                "Hafta sonu memlekete dönüş için otogara gidiyoruz. Son 1 kişi arıyoruz!",
                "OPEN",
                now.minusMinutes(120)
        );
        lobbyRepo.save(l2);
        memberRepo.save(new TaxiLobbyMember(l2.getId(), "deniz_kaya", "Deniz Kaya", "student", "0555 444 33 22", now.minusMinutes(120)));
        memberRepo.save(new TaxiLobbyMember(l2.getId(), "berk", "Berk Yılmaz", "coffee", "0532 999 88 77", now.minusMinutes(85)));
        memberRepo.save(new TaxiLobbyMember(l2.getId(), "melis", "Melis Çelik", "sparkles", "0544 333 22 11", now.minusMinutes(30)));

        // 3. Merkez İskele - Hamsilos & Akliman Doğa Gezisi
        TaxiLobby l3 = new TaxiLobby(
                "tl-seed-3",
                "caner99",
                "Caner Öztürk",
                "camera",
                "0505 123 45 67",
                "Hamsilos Tabiat Parkı & Akliman",
                "İskele Meydanı Taksi Durağı",
                "Yarın 11:00",
                4,
                1,
                "500 ₺ (Kişi başı ~125 ₺)",
                "Fotoğraf çekimi ve doğa yürüyüşü için gidiyoruz. Masrafı 4'e bölmek isteyen doğaseverler gelsin.",
                "OPEN",
                now.minusHours(3)
        );
        lobbyRepo.save(l3);
        memberRepo.save(new TaxiLobbyMember(l3.getId(), "caner99", "Caner Öztürk", "camera", "0505 123 45 67", now.minusHours(3)));

        // 4. Otogar - SNÜ Boyabat / Kampüs Gece Gelişi
        TaxiLobby l4 = new TaxiLobby(
                "tl-seed-4",
                "zeynep_snu",
                "Zeynep Demir",
                "guitar",
                "0530 777 66 55",
                "SNÜ Kampüs / Seyyid Bilal KYK",
                "Sinop Otogarı (Geliş Peronu)",
                "Pazar 22:30",
                4,
                3,
                "320 ₺ (Kişi başı ~80 ₺)",
                "Gece otobüsünden inip doğrudan yurda geçeceğiz. Gece tarifesinde tek binmeyelim, birleşelim.",
                "OPEN",
                now.minusHours(5)
        );
        lobbyRepo.save(l4);
        memberRepo.save(new TaxiLobbyMember(l4.getId(), "zeynep_snu", "Zeynep Demir", "guitar", "0530 777 66 55", now.minusHours(5)));
        memberRepo.save(new TaxiLobbyMember(l4.getId(), "mert", "Mert Koç", "student", "0541 222 33 44", now.minusHours(4)));
        memberRepo.save(new TaxiLobbyMember(l4.getId(), "elif", "Elif Demir", "sparkles", "0535 666 55 44", now.minusHours(2)));
    }
}
