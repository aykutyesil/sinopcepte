package com.sinopcepte.venue;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VenueClaimRequestRepository extends JpaRepository<VenueClaimRequest, String> {
    List<VenueClaimRequest> findAllByOrderByCreatedAtDesc();
    List<VenueClaimRequest> findByItemIdOrderByCreatedAtDesc(String itemId);
    List<VenueClaimRequest> findByUserHandleOrderByCreatedAtDesc(String userHandle);
}
