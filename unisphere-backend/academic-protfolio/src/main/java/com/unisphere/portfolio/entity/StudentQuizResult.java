package com.unisphere.portfolio.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_quiz_results",
       uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "session_id"}))
public class StudentQuizResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;

    @Column(nullable = false)
    private Integer score;          // correct answers

    @Column(nullable = false)
    private Integer totalQuestions;

    @Column(nullable = false)
    private Integer percentage;     // 0-100

    @Column(nullable = false)
    private Boolean passed;         // >= 80%

    @Column(nullable = false, updatable = false)
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() { completedAt = LocalDateTime.now(); }

    public StudentQuizResult() {}

    public StudentQuizResult(Student student, Session session, int score, int totalQuestions) {
        this.student = student;
        this.session = session;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.percentage = totalQuestions > 0 ? (score * 100 / totalQuestions) : 0;
        this.passed = this.percentage >= 80;
    }

    public Long getId() { return id; }
    public Student getStudent() { return student; }
    public Session getSession() { return session; }
    public Integer getScore() { return score; }
    public Integer getTotalQuestions() { return totalQuestions; }
    public Integer getPercentage() { return percentage; }
    public Boolean getPassed() { return passed; }
    public LocalDateTime getCompletedAt() { return completedAt; }
}
