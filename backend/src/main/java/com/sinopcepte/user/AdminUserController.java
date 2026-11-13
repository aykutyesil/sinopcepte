package com.sinopcepte.user;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sinopcepte.auth.AppUser;
import com.sinopcepte.auth.AppUserRepository;
import com.sinopcepte.catalog.Item;
import com.sinopcepte.catalog.ItemRepository;
import com.sinopcepte.checkin.VenueCheckin;
import com.sinopcepte.checkin.VenueCheckinRepository;
import com.sinopcepte.confession.Confession;
import com.sinopcepte.confession.ConfessionRepository;
import com.sinopcepte.okeye4.Okeye4Lobby;
import com.sinopcepte.okeye4.Okeye4LobbyRepository;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AppUserRepository users;
    private final ItemRepository items;
    private final VenueCheckinRepository checkins;
    private final Okeye4LobbyRepository lobbies;
    private final ConfessionRepository confessions;

    public AdminUserController(AppUserRepository users, ItemRepository items,
                               VenueCheckinRepository checkins, Okeye4LobbyRepository lobbies,
                               ConfessionRepository confessions) {
        this.users = users;
        this.items = items;
        this.checkins = checkins;
        this.lobbies = lobbies;
        this.confessions = confessions;
    }

    @GetMapping
    public List<AdminUserSummaryDto> listAllUsers() {
        List<AppUser> allUsers = users.findAll();
        List<Item> allItems = items.findAll();
        List<VenueCheckin> allCheckins = checkins.findAll();
        List<Okeye4Lobby> allLobbies = lobbies.findAll();
        List<Confession> allConfessions = confessions.findAll();

        Map<String, List<String>> userVenues = allItems.stream()
                .filter(i -> i.getOwnerHandle() != null && !i.getOwnerHandle().isBlank())
                .collect(Collectors.groupingBy(
                        i -> i.getOwnerHandle().toLowerCase(),
                        Collectors.mapping(Item::getTitle, Collectors.toList())
                ));

        Map<String, Long> checkinCounts = allCheckins.stream()
                .collect(Collectors.groupingBy(c -> c.getHandle().toLowerCase(), Collectors.counting()));

        Map<String, Long> lobbyCounts = allLobbies.stream()
                .collect(Collectors.groupingBy(l -> l.getHostHandle().toLowerCase(), Collectors.counting()));

        Map<String, Long> confessionCounts = allConfessions.stream()
                .filter(c -> c.getAuthorHandle() != null)
                .collect(Collectors.groupingBy(c -> c.getAuthorHandle().toLowerCase(), Collectors.counting()));

        return allUsers.stream().map(u -> {
            String h = u.getUsername().toLowerCase();
            return new AdminUserSummaryDto(
                    u.getId(),
                    u.getUsername(),
                    u.getEmail(),
                    u.getPhone(),
                    u.getRole(),
                    u.getAvatar(),
                    u.getBio(),
                    u.getInstagram(),
                    u.getBadgesJson(),
                    u.getCheckinVisibility(),
                    u.isAnonymousMode(),
                    u.getCreatedAt(),
                    checkinCounts.getOrDefault(h, 0L).intValue(),
                    lobbyCounts.getOrDefault(h, 0L).intValue(),
                    confessionCounts.getOrDefault(h, 0L).intValue(),
                    userVenues.getOrDefault(h, List.of())
            );
        }).toList();
    }
}
