package com.unisphere.portfolio.dto;

import java.math.BigDecimal;
import java.util.List;

public class SessionResponse {
    private Long id;
    private String sessionName;
    private BigDecimal price;
    private Integer silverBadgeThreshold;
    private Integer bronzeBadgeThreshold;
    private Integer goldBadgeThreshold;
    private String thumbnail;
    private List<VideoResponse> videos;
    private Long createdAt;
    private Long updatedAt;
    
    // Constructors
    public SessionResponse() {}
    
    public SessionResponse(Long id, String sessionName, BigDecimal price, Integer silverBadgeThreshold,
                          Integer bronzeBadgeThreshold, Integer goldBadgeThreshold, String thumbnail, List<VideoResponse> videos,
                          Long createdAt, Long updatedAt) {
        this.id = id;
        this.sessionName = sessionName;
        this.price = price;
        this.silverBadgeThreshold = silverBadgeThreshold;
        this.bronzeBadgeThreshold = bronzeBadgeThreshold;
        this.goldBadgeThreshold = goldBadgeThreshold;
        this.thumbnail = thumbnail;
        this.videos = videos;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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
    
    public List<VideoResponse> getVideos() {
        return videos;
    }
    
    public void setVideos(List<VideoResponse> videos) {
        this.videos = videos;
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
    
    // Inner class for video responses
    public static class VideoResponse {
        private Long id;
        private String title;
        private String youtubeUrl;
        private Integer videoOrder;
        
        public VideoResponse() {}
        
        public VideoResponse(Long id, String title, String youtubeUrl, Integer videoOrder) {
            this.id = id;
            this.title = title;
            this.youtubeUrl = youtubeUrl;
            this.videoOrder = videoOrder;
        }
        
        public Long getId() {
            return id;
        }
        
        public void setId(Long id) {
            this.id = id;
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
    }
}
