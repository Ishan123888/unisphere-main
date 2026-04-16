package com.unisphere.portfolio.service.impl;

import com.unisphere.portfolio.dto.BadgeEarnedResponse;
import com.unisphere.portfolio.entity.*;
import com.unisphere.portfolio.repository.*;
import com.unisphere.portfolio.service.BadgeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class BadgeServiceImpl implements BadgeService {
    
    @Autowired
    private SessionVideoPlayRepository videoPlayRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private SessionRepository sessionRepository;
    
    @Autowired
    private SessionVideoRepository videoRepository;
    
    @Autowired
    private StudentBadgeRepository studentBadgeRepository;
    
    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private StudentVideoWatchRepository studentVideoWatchRepository;
    
    @Override
    public BadgeEarnedResponse recordVideoPlay(Long studentId, Long sessionId, Long videoId) {
        try {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            Session session = sessionRepository.findById(sessionId)
                    .orElseThrow(() -> new RuntimeException("Session not found"));
            SessionVideo video = videoRepository.findById(videoId)
                    .orElseThrow(() -> new RuntimeException("Video not found"));
            
            Optional<SessionVideoPlay> existingPlay = videoPlayRepository.findByStudentIdAndSessionIdAndVideoId(studentId, sessionId, videoId);
            if (existingPlay.isEmpty()) {
                SessionVideoPlay play = new SessionVideoPlay(student, session, video);
                videoPlayRepository.save(play);
            }
            
            long videoPlayCount = getEffectiveCount(studentId, sessionId);
            
            String badgeEarned = null;
            Boolean isNewBadge = false;
            String badgeIcon = null;
            String badgeName = null;
            
            if (videoPlayCount >= session.getGoldBadgeThreshold()) {
                badgeEarned = "GOLD"; badgeIcon = "🥇"; badgeName = "Gold Badge";
                isNewBadge = checkAndAwardBadge(student, "GOLD", session);
            } else if (videoPlayCount >= session.getSilverBadgeThreshold()) {
                badgeEarned = "SILVER"; badgeIcon = "🥈"; badgeName = "Silver Badge";
                isNewBadge = checkAndAwardBadge(student, "SILVER", session);
            } else if (videoPlayCount >= session.getBronzeBadgeThreshold()) {
                badgeEarned = "BRONZE"; badgeIcon = "🥉"; badgeName = "Bronze Badge";
                isNewBadge = checkAndAwardBadge(student, "BRONZE", session);
            }
            
            return new BadgeEarnedResponse(videoPlayCount, badgeEarned, isNewBadge, badgeIcon, badgeName);
        } catch (Exception e) {
            throw new RuntimeException("Error recording video play: " + e.getMessage(), e);
        }
    }
    
    @Override
    public Long getVideoPlayCount(Long studentId, Long sessionId) {
        return getEffectiveCount(studentId, sessionId);
    }

    // Returns the higher of YouTube plays or uploaded video watches
    private long getEffectiveCount(Long studentId, Long sessionId) {
        long youtubeCount = videoPlayRepository.countVideoPlaysByStudentAndSession(studentId, sessionId);
        long watchCount = studentVideoWatchRepository.findWatchedVideoIdsByStudentAndSession(studentId, sessionId).size();
        return Math.max(youtubeCount, watchCount);
    }
    
    @Override
    public String getEarnedBadgeForSession(Long studentId, Long sessionId) {
        try {
            Session session = sessionRepository.findById(sessionId)
                    .orElseThrow(() -> new RuntimeException("Session not found"));
            
            long count = getEffectiveCount(studentId, sessionId);
            
            if (count >= session.getGoldBadgeThreshold()) return "GOLD";
            if (count >= session.getSilverBadgeThreshold()) return "SILVER";
            if (count >= session.getBronzeBadgeThreshold()) return "BRONZE";
            return null;
        } catch (Exception e) {
            return null;
        }
    }
    
    private Boolean checkAndAwardBadge(Student student, String badgeType, Session session) {
        try {
            Badge badge = badgeRepository.findByBadgeName(badgeType + " - " + session.getSessionName())
                    .orElseGet(() -> {
                        Badge newBadge = new Badge();
                        newBadge.setBadgeName(badgeType + " - " + session.getSessionName());
                        newBadge.setDescription(badgeType + " badge earned in " + session.getSessionName());
                        return badgeRepository.save(newBadge);
                    });
            
            Optional<StudentBadge> existingBadge = studentBadgeRepository.findByStudentIdAndBadgeId(student.getId(), badge.getId());
            if (existingBadge.isEmpty()) {
                StudentBadge studentBadge = new StudentBadge();
                studentBadge.setStudent(student);
                studentBadge.setBadge(badge);
                studentBadge.setAssignedAt(LocalDateTime.now());
                studentBadgeRepository.save(studentBadge);
                return true;
            }
            return false;
        } catch (Exception e) {
            System.err.println("Error awarding badge: " + e.getMessage());
            return false;
        }
    }
}
