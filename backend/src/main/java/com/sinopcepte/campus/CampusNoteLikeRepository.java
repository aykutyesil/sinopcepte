package com.sinopcepte.campus;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CampusNoteLikeRepository extends JpaRepository<CampusNoteLike, Long> {
    Optional<CampusNoteLike> findByNoteIdAndUserHandle(String noteId, String userHandle);
    boolean existsByNoteIdAndUserHandle(String noteId, String userHandle);
    void deleteByNoteIdAndUserHandle(String noteId, String userHandle);
}
