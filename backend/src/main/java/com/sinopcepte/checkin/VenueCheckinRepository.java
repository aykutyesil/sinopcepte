package com.sinopcepte.checkin;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VenueCheckinRepository extends JpaRepository<VenueCheckin, String> {
    List<VenueCheckin> findAllByOrderByCheckedInAtDesc();
    List<VenueCheckin> findByItemIdOrderByCheckedInAtDesc(String itemId);
    List<VenueCheckin> findByHandleOrderByCheckedInAtDesc(String handle);
}
