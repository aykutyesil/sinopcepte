package com.sinopcepte.confession;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConfessionCommentRepository extends JpaRepository<ConfessionComment, String> {
    List<ConfessionComment> findByConfessionIdOrderByCreatedAtAsc(String confessionId);
}
