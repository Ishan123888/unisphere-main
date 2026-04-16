package com.unisphere.portfolio.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "session_video_plays", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "session_id", "video_id"})
})
public class SessionVideoPlay {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private Session session;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id", nullable = false, foreignKey = @ForeignKey(name = "FKjej1umlrnrhlgylq3qcuhr2gv"))
    private SessionVideo video;
    
    @Column(nullable = false)
    private LocalDateTime playedAt = LocalDateTime.now();
    
    // Constructors
    public SessionVideoPlay() {}
    
    public SessionVideoPlay(Student student, Session session, SessionVideo video) {
        this.student = student;
        this.session = session;
        this.video = video;
        this.playedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Student getStudent() {
        return student;
    }
    
    public void setStudent(Student student) {
        this.student = student;
    }
    
    public Session getSession() {
        return session;
    }
    
    public void setSession(Session session) {
        this.session = session;
    }
    
    public SessionVideo getVideo() {
        return video;
    }
    
    public void setVideo(SessionVideo video) {
        this.video = video;
    }
    
    public LocalDateTime getPlayedAt() {
        return playedAt;
    }
    
    public void setPlayedAt(LocalDateTime playedAt) {
        this.playedAt = playedAt;
    }
}
