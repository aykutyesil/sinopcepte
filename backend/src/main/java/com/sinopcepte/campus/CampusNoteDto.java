package com.sinopcepte.campus;

import java.time.OffsetDateTime;

public record CampusNoteDto(
    String id,
    String authorHandle,
    String authorName,
    String authorAvatar,
    String faculty,
    String department,
    String courseCode,
    String courseName,
    String term,
    String examType,
    String title,
    String description,
    String fileUrl,
    String fileName,
    String fileSize,
    int likeCount,
    int downloadCount,
    boolean likedByMe,
    OffsetDateTime createdAt
) {
    public static CampusNoteDto fromEntity(CampusNote note, boolean likedByMe) {
        return new CampusNoteDto(
            note.getId(),
            note.getAuthorHandle(),
            note.getAuthorName(),
            note.getAuthorAvatar(),
            note.getFaculty(),
            note.getDepartment(),
            note.getCourseCode(),
            note.getCourseName(),
            note.getTerm(),
            note.getExamType(),
            note.getTitle(),
            note.getDescription(),
            note.getFileUrl(),
            note.getFileName(),
            note.getFileSize(),
            note.getLikeCount(),
            note.getDownloadCount(),
            likedByMe,
            note.getCreatedAt()
        );
    }
}
