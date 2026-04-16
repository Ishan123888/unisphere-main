package com.unisphere.portfolio.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "session_quiz_configs")
public class SessionQuizConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "session_id", nullable = false, unique = true)
    private Session session;

    @Column(nullable = false)
    private Integer timeLimitMinutes; // total time for all questions

    public SessionQuizConfig() {}

    public SessionQuizConfig(Session session, Integer timeLimitMinutes) {
        this.session = session;
        this.timeLimitMinutes = timeLimitMinutes;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Session getSession() { return session; }
    public void setSession(Session session) { this.session = session; }
    public Integer getTimeLimitMinutes() { return timeLimitMinutes; }
    public void setTimeLimitMinutes(Integer timeLimitMinutes) { this.timeLimitMinutes = timeLimitMinutes; }
}
