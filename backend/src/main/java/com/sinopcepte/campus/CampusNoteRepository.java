package com.sinopcepte.campus;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CampusNoteRepository extends JpaRepository<CampusNote, String> {

    @Query("""
        SELECT n FROM CampusNote n
        WHERE (CAST(:faculty AS string) IS NULL OR LOWER(n.faculty) = CAST(:faculty AS string))
          AND (CAST(:department AS string) IS NULL OR LOWER(n.department) = CAST(:department AS string))
          AND (CAST(:examType AS string) IS NULL OR LOWER(n.examType) = CAST(:examType AS string))
          AND (CAST(:q AS string) IS NULL OR (
                LOWER(n.title) LIKE CONCAT('%', CAST(:q AS string), '%')
                OR LOWER(n.courseName) LIKE CONCAT('%', CAST(:q AS string), '%')
                OR LOWER(n.courseCode) LIKE CONCAT('%', CAST(:q AS string), '%')
                OR LOWER(n.description) LIKE CONCAT('%', CAST(:q AS string), '%')
          ))
        ORDER BY n.createdAt DESC
    """)
    List<CampusNote> searchNotes(
        @Param("faculty") String faculty,
        @Param("department") String department,
        @Param("examType") String examType,
        @Param("q") String q
    );
}
