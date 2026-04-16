package com.unisphere.portfolio.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_video_watches",
       uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "video_file_id"}))
public class StudentVideoWatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_file_id", nullable = false)
    private SessionVideoFile videoFile;

    @Column(nullable = false, updatable = false)
    private LocalDateTime watchedAt;

    @PrePersist
    protected void onCreate() { watchedAt = LocalDateTime.now(); }

    public StudentVideoWatch() {}

    public StudentVideoWatch(Student student, SessionVideoFile videoFile) {
        this.student = student;
        this.videoFile = videoFile;
    }

    public Long getId() { return id; }
    public Student getStudent() { return student; }
    public SessionVideoFile getVideoFile() { return videoFile; }
    public LocalDateTime getWatchedAt() { return watchedAt; }
}
