package com.sinopcepte.confession;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConfessionRepository extends JpaRepository<Confession, String> {
    List<Confession> findByHiddenFalseOrderByCreatedAtDesc();
    List<Confession> findAllByOrderByCreatedAtDesc();
    List<Confession> findByHiddenFalseAndCategoryOrderByCreatedAtDesc(String category);
    List<Confession> findByHiddenFalseAndVenueIdOrderByCreatedAtDesc(String venueId);
}
