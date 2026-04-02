package com.unisphere.portfolio.dto;

public class BadgeEarnedResponse {
    private Long videoPlayCount;
    private String badgeEarned; // "SILVER", "BRONZE", "GOLD", or null
    private Boolean isNewBadge;
    private String badgeIcon; // 🥈, 🥉, 🥇
    private String badgeName;
    
    public BadgeEarnedResponse() {}
    
    public BadgeEarnedResponse(Long videoPlayCount, String badgeEarned, Boolean isNewBadge, String badgeIcon, String badgeName) {
        this.videoPlayCount = videoPlayCount;
        this.badgeEarned = badgeEarned;
        this.isNewBadge = isNewBadge;
        this.badgeIcon = badgeIcon;
        this.badgeName = badgeName;
    }
    
    // Getters and Setters
    public Long getVideoPlayCount() {
        return videoPlayCount;
    }
    
    public void setVideoPlayCount(Long videoPlayCount) {
        this.videoPlayCount = videoPlayCount;
    }
    
    public String getBadgeEarned() {
        return badgeEarned;
    }
    
    public void setBadgeEarned(String badgeEarned) {
        this.badgeEarned = badgeEarned;
    }
    
    public Boolean getIsNewBadge() {
        return isNewBadge;
    }
    
    public void setIsNewBadge(Boolean isNewBadge) {
        this.isNewBadge = isNewBadge;
    }
    
    public String getBadgeIcon() {
        return badgeIcon;
    }
    
    public void setBadgeIcon(String badgeIcon) {
        this.badgeIcon = badgeIcon;
    }
    
    public String getBadgeName() {
        return badgeName;
    }
    
    public void setBadgeName(String badgeName) {
        this.badgeName = badgeName;
    }
}
