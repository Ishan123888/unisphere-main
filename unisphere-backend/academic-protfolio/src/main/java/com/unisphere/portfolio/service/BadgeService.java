package com.unisphere.portfolio.service;

import com.unisphere.portfolio.dto.BadgeEarnedResponse;

public interface BadgeService {
    
    /**
     * Record a video play and check if student earned a badge
     * @param studentId Student ID
     * @param sessionId Session ID
     * @param videoId Video ID
     * @return Badge earned response with badge info if earned
     */
    BadgeEarnedResponse recordVideoPlay(Long studentId, Long sessionId, Long videoId);
    
    /**
     * Get video play count for student in a session
     * @param studentId Student ID
     * @param sessionId Session ID
     * @return Number of videos played
     */
    Long getVideoPlayCount(Long studentId, Long sessionId);
    
    /**
     * Check if student has earned a badge for a session
     * @param studentId Student ID
     * @param sessionId Session ID
     * @return Badge type earned or null
     */
    String getEarnedBadgeForSession(Long studentId, Long sessionId);
}
