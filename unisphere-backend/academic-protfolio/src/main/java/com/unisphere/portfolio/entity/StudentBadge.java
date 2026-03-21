package com.unisphere.portfolio.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
@Entity
public class StudentBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Student student;

    @ManyToOne
    private Badge badge;

    private LocalDateTime assignedAt;

    // getters & setters
    public Long getId() { return id; }
    public Student getStudent() { return student; }
    public Badge getBadge() { return badge; }
    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setStudent(Student student) { this.student = student; }
    public void setBadge(Badge badge) { this.badge = badge; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }
}