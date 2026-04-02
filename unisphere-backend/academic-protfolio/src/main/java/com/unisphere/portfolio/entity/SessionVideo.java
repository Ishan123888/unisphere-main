package com.unisphere.portfolio.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "session_videos")
public class SessionVideo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    @JsonIgnore
    private Session session;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String youtubeUrl;
    
    @Column(nullable = false)
    private Integer videoOrder;
    
    @Column(nullable = false, updatable = false)
    private Long createdAt = System.currentTimeMillis();
    
    // Constructors
    public SessionVideo() {}
    
    public SessionVideo(Session session, String title, String youtubeUrl, Integer videoOrder) {
        this.session = session;
        this.title = title;
        this.youtubeUrl = youtubeUrl;
        this.videoOrder = videoOrder;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Session getSession() {
        return session;
    }
    
    public void setSession(Session session) {
        this.session = session;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getYoutubeUrl() {
        return youtubeUrl;
    }
    
    public void setYoutubeUrl(String youtubeUrl) {
        this.youtubeUrl = youtubeUrl;
    }
    
    public Integer getVideoOrder() {
        return videoOrder;
    }
    
    public void setVideoOrder(Integer videoOrder) {
        this.videoOrder = videoOrder;
    }
    
    public Long getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Long createdAt) {
        this.createdAt = createdAt;
    }
}
