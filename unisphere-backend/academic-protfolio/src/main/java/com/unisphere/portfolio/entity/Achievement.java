package com.unisphere.portfolio.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "achievements")
public class Achievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    private String title;
    private String category;
    private String description;
    private String institution;
    private String level;
    private LocalDate achievementDate;

    private String certificateFileName;
    private String certificateUrl;

    @Enumerated(EnumType.STRING)
    private AchievementStatus status;

    private String adminComment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ===== GETTERS & SETTERS =====

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public Student getStudent() { return student; }

    public void setStudent(Student student) { this.student = student; }

    public String getTitle() { return title; }

    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }

    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }

    public void setDescription(String description) { this.description = description; }

    public String getInstitution() { return institution; }

    public void setInstitution(String institution) { this.institution = institution; }

    public String getLevel() { return level; }

    public void setLevel(String level) { this.level = level; }

    public LocalDate getAchievementDate() { return achievementDate; }

    public void setAchievementDate(LocalDate achievementDate) { this.achievementDate = achievementDate; }

    public String getCertificateFileName() { return certificateFileName; }

    public void setCertificateFileName(String certificateFileName) { this.certificateFileName = certificateFileName; }

    public String getCertificateUrl() { return certificateUrl; }

    public void setCertificateUrl(String certificateUrl) { this.certificateUrl = certificateUrl; }

    public AchievementStatus getStatus() { return status; }

    public void setStatus(AchievementStatus status) { this.status = status; }

    public String getAdminComment() { return adminComment; }

    public void setAdminComment(String adminComment) { this.adminComment = adminComment; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}