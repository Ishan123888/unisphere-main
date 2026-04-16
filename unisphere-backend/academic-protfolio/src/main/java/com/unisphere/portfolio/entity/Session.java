package com.unisphere.portfolio.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;
import java.math.BigDecimal;

@Entity
@Table(name = "sessions")
public class Session {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String sessionName;
    
    @Column(nullable = false)
    private BigDecimal price;
    
    @Column(nullable = false)
    private Integer silverBadgeThreshold;
    
    @Column(nullable = false)
    private Integer bronzeBadgeThreshold;
    
    @Column(nullable = false)
    private Integer goldBadgeThreshold;
    
    @Column(columnDefinition = "LONGTEXT")
    private String thumbnail;
    
    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<SessionVideo> videos = new java.util.ArrayList<>();
    
    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<SessionPayment> payments;
    
    @Column(nullable = false, updatable = false)
    private Long createdAt = System.currentTimeMillis();
    
    @Column(nullable = false)
    private Long updatedAt = System.currentTimeMillis();
    
    // Constructors
    public Session() {}
    
    public Session(String sessionName, BigDecimal price, Integer silverBadgeThreshold, 
                   Integer bronzeBadgeThreshold, Integer goldBadgeThreshold) {
        this.sessionName = sessionName;
        this.price = price;
        this.silverBadgeThreshold = silverBadgeThreshold;
        this.bronzeBadgeThreshold = bronzeBadgeThreshold;
        this.goldBadgeThreshold = goldBadgeThreshold;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getSessionName() {
        return sessionName;
    }
    
    public void setSessionName(String sessionName) {
        this.sessionName = sessionName;
    }
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public Integer getSilverBadgeThreshold() {
        return silverBadgeThreshold;
    }
    
    public void setSilverBadgeThreshold(Integer silverBadgeThreshold) {
        this.silverBadgeThreshold = silverBadgeThreshold;
    }
    
    public Integer getBronzeBadgeThreshold() {
        return bronzeBadgeThreshold;
    }
    
    public void setBronzeBadgeThreshold(Integer bronzeBadgeThreshold) {
        this.bronzeBadgeThreshold = bronzeBadgeThreshold;
    }
    
    public Integer getGoldBadgeThreshold() {
        return goldBadgeThreshold;
    }
    
    public void setGoldBadgeThreshold(Integer goldBadgeThreshold) {
        this.goldBadgeThreshold = goldBadgeThreshold;
    }
    
    public String getThumbnail() {
        return thumbnail;
    }
    
    public void setThumbnail(String thumbnail) {
        this.thumbnail = thumbnail;
    }
    
    public List<SessionVideo> getVideos() {
        return videos;
    }
    
    public void setVideos(List<SessionVideo> videos) {
        this.videos = videos;
    }

    public List<SessionPayment> getPayments() {
        return payments;
    }

    public void setPayments(List<SessionPayment> payments) {
        this.payments = payments;
    }
    
    public Long getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Long createdAt) {
        this.createdAt = createdAt;
    }
    
    public Long getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(Long updatedAt) {
        this.updatedAt = updatedAt;
    }
}
