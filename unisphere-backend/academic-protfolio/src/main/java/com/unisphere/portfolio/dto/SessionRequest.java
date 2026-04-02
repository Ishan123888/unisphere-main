package com.unisphere.portfolio.dto;

import java.math.BigDecimal;
import java.util.List;

public class SessionRequest {
    private String sessionName;
    private BigDecimal price;
    private Integer silverBadgeThreshold;
    private Integer bronzeBadgeThreshold;
    private Integer goldBadgeThreshold;
    private String thumbnail;
    private List<VideoRequest> videos;
    
    // Constructors
    public SessionRequest() {}
    
    public SessionRequest(String sessionName, BigDecimal price, Integer silverBadgeThreshold,
                         Integer bronzeBadgeThreshold, Integer goldBadgeThreshold, String thumbnail, List<VideoRequest> videos) {
        this.sessionName = sessionName;
        this.price = price;
        this.silverBadgeThreshold = silverBadgeThreshold;
        this.bronzeBadgeThreshold = bronzeBadgeThreshold;
        this.goldBadgeThreshold = goldBadgeThreshold;
        this.thumbnail = thumbnail;
        this.videos = videos;
    }
    
    // Getters and Setters
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
    
    public List<VideoRequest> getVideos() {
        return videos;
    }
    
    public void setVideos(List<VideoRequest> videos) {
        this.videos = videos;
    }
    
    // Inner class for video requests
    public static class VideoRequest {
        private String title;
        private String youtubeUrl;
        
        public VideoRequest() {}
        
        public VideoRequest(String title, String youtubeUrl) {
            this.title = title;
            this.youtubeUrl = youtubeUrl;
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
    }
}
