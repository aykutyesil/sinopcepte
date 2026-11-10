package com.sinopcepte.confession;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConfessionReactionRepository extends JpaRepository<ConfessionReaction, Long> {
    Optional<ConfessionReaction> findByConfessionIdAndUserHandleAndReactionType(String confessionId, String userHandle, String reactionType);
    List<ConfessionReaction> findByConfessionId(String confessionId);
    List<ConfessionReaction> findByUserHandle(String userHandle);
    List<ConfessionReaction> findByConfessionIdAndUserHandle(String confessionId, String userHandle);
}
