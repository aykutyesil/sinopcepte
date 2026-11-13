package com.sinopcepte.campus;

import java.time.OffsetDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "campus_note")
public class CampusNote {

    @Id
    private String id;

    @Column(name = "author_handle", nullable = false)
    private String authorHandle;

    @Column(name = "author_name", nullable = false)
    private String authorName;

    @Column(name = "author_avatar", nullable = false)
    private String authorAvatar = "student";

    @Column(nullable = false)
    private String faculty;

    @Column(nullable = false)
    private String department;

    @Column(name = "course_code", nullable = false)
    private String courseCode;

    @Column(name = "course_name", nullable = false)
    private String courseName;

    @Column(nullable = false)
    private String term = "Güz";

    @Column(name = "exam_type", nullable = false)
    private String examType = "Vize";

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_size", nullable = false)
    private String fileSize = "1.5 MB";

    @Column(name = "like_count", nullable = false)
    private int likeCount = 0;

    @Column(name = "download_count", nullable = false)
    private int downloadCount = 0;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public CampusNote() {}

    public CampusNote(String id, String authorHandle, String authorName, String authorAvatar,
                      String faculty, String department, String courseCode, String courseName,
                      String term, String examType, String title, String description,
                      String fileUrl, String fileName, String fileSize) {
        this.id = id;
        this.authorHandle = authorHandle;
        this.authorName = authorName;
        this.authorAvatar = authorAvatar;
        this.faculty = faculty;
        this.department = department;
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.term = term;
        this.examType = examType;
        this.title = title;
        this.description = description;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
        this.fileSize = fileSize;
        this.createdAt = OffsetDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAuthorHandle() { return authorHandle; }
    public void setAuthorHandle(String authorHandle) { this.authorHandle = authorHandle; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getAuthorAvatar() { return authorAvatar; }
    public void setAuthorAvatar(String authorAvatar) { this.authorAvatar = authorAvatar; }

    public String getFaculty() { return faculty; }
    public void setFaculty(String faculty) { this.faculty = faculty; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }

    public String getTerm() { return term; }
    public void setTerm(String term) { this.term = term; }

    public String getExamType() { return examType; }
    public void setExamType(String examType) { this.examType = examType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileSize() { return fileSize; }
    public void setFileSize(String fileSize) { this.fileSize = fileSize; }

    public int getLikeCount() { return likeCount; }
    public void setLikeCount(int likeCount) { this.likeCount = likeCount; }

    public int getDownloadCount() { return downloadCount; }
    public void setDownloadCount(int downloadCount) { this.downloadCount = downloadCount; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
