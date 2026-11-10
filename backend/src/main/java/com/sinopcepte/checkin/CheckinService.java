package com.sinopcepte.checkin;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sinopcepte.auth.AppUser;
import com.sinopcepte.web.BadRequestException;

@Service
public class CheckinService {

    private final VenueCheckinRepository checkins;
    private final Clock clock;

    public CheckinService(VenueCheckinRepository checkins, Clock clock) {
        this.checkins = checkins;
        this.clock = clock;
    }

    public List<VenueCheckin> listAll() {
        return checkins.findAllByOrderByCheckedInAtDesc();
    }

    public List<VenueCheckin> listByVenue(String itemId) {
        return checkins.findByItemIdOrderByCheckedInAtDesc(itemId);
    }

    @Transactional
    public VenueCheckin checkIn(AppUser user, String itemId, String displayName, String avatar, String note, String mood) {
        if (itemId == null || itemId.isBlank()) {
            throw new BadRequestException("Mekan seçilmelidir");
        }
        String id = "c-" + UUID.randomUUID().toString().substring(0, 8);
        String name = (displayName != null && !displayName.isBlank()) ? displayName.trim() : user.getUsername();
        String av = (avatar != null && !avatar.isBlank()) ? avatar.trim() : user.getAvatar();
        OffsetDateTime now = OffsetDateTime.now(clock);

        VenueCheckin checkin = new VenueCheckin(id, itemId, user.getUsername(), name, av,
                note != null ? note.trim() : null,
                mood != null ? mood.trim() : null,
                now);
        return checkins.save(checkin);
    }
}
