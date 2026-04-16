package com.unisphere.portfolio.service.impl;

import com.unisphere.portfolio.dto.SessionRequest;
import com.unisphere.portfolio.dto.SessionResponse;
import com.unisphere.portfolio.entity.Session;
import com.unisphere.portfolio.entity.SessionVideo;
import com.unisphere.portfolio.repository.SessionRepository;
import com.unisphere.portfolio.repository.SessionVideoPlayRepository;
import com.unisphere.portfolio.repository.SessionVideoRepository;
import com.unisphere.portfolio.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SessionServiceImpl implements SessionService {
    
    @Autowired
    private SessionRepository sessionRepository;
    
    @Autowired
    private SessionVideoRepository sessionVideoRepository;

    @Autowired
    private SessionVideoPlayRepository sessionVideoPlayRepository;
    
    @Override
    public SessionResponse createSession(SessionRequest request) {
        // Create new session
        Session session = new Session(
            request.getSessionName(),
            request.getPrice(),
            request.getSilverBadgeThreshold(),
            request.getBronzeBadgeThreshold(),
            request.getGoldBadgeThreshold()
        );
        
        session.setThumbnail(request.getThumbnail());
        
        // Save session first
        Session savedSession = sessionRepository.save(session);
        
        // Add videos
        if (request.getVideos() != null && !request.getVideos().isEmpty()) {
            List<SessionVideo> videos = request.getVideos().stream()
                .mapToInt(v -> request.getVideos().indexOf(v))
                .mapToObj(index -> {
                    SessionRequest.VideoRequest videoReq = request.getVideos().get(index);
                    return new SessionVideo(savedSession, videoReq.getTitle(), videoReq.getYoutubeUrl(), index + 1);
                })
                .collect(Collectors.toList());
            
            List<SessionVideo> savedVideos = sessionVideoRepository.saveAll(videos);
            savedSession.setVideos(savedVideos);
        }
        
        return convertToResponse(savedSession);
    }
    
    @Override
    public SessionResponse getSessionById(Long id) {
        Session session = sessionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Session not found with id: " + id));
        
        // Load videos
        List<SessionVideo> videos = sessionVideoRepository.findBySessionIdOrderByVideoOrder(id);
        session.setVideos(videos);
        
        return convertToResponse(session);
    }
    
    @Override
    public List<SessionResponse> getAllSessions() {
        List<Session> sessions = sessionRepository.findAllByOrderByCreatedAtDesc();
        
        return sessions.stream()
            .map(session -> {
                List<SessionVideo> videos = sessionVideoRepository.findBySessionIdOrderByVideoOrder(session.getId());
                session.setVideos(videos);
                return convertToResponse(session);
            })
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public SessionResponse updateSession(Long id, SessionRequest request) {
        Session session = sessionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Session not found with id: " + id));
        
        // Update basic fields
        session.setSessionName(request.getSessionName());
        session.setPrice(request.getPrice());
        session.setSilverBadgeThreshold(request.getSilverBadgeThreshold());
        session.setBronzeBadgeThreshold(request.getBronzeBadgeThreshold());
        session.setGoldBadgeThreshold(request.getGoldBadgeThreshold());
        session.setUpdatedAt(System.currentTimeMillis());
        
        // Update thumbnail if provided
        if (request.getThumbnail() != null && !request.getThumbnail().isEmpty()) {
            session.setThumbnail(request.getThumbnail());
        }
        
        // Delete video plays first to avoid FK constraint, then clear videos
        if (session.getVideos() != null && !session.getVideos().isEmpty()) {
            List<Long> videoIds = session.getVideos().stream()
                .map(SessionVideo::getId)
                .filter(vid -> vid != null)
                .collect(Collectors.toList());
            if (!videoIds.isEmpty()) {
                sessionVideoPlayRepository.deleteByVideoIdIn(videoIds);
            }
            // Must clear the existing collection, NOT replace it (orphanRemoval requirement)
            session.getVideos().clear();
        }
        
        // Save to flush the clears before adding new videos
        sessionRepository.saveAndFlush(session);
        
        // Add new videos into the same collection
        if (request.getVideos() != null && !request.getVideos().isEmpty()) {
            for (int i = 0; i < request.getVideos().size(); i++) {
                SessionRequest.VideoRequest videoReq = request.getVideos().get(i);
                session.getVideos().add(new SessionVideo(session, videoReq.getTitle(), videoReq.getYoutubeUrl(), i + 1));
            }
        }
        
        Session updatedSession = sessionRepository.save(session);
        return convertToResponse(updatedSession);
    }
    
    @Override
    public void deleteSession(Long id) {
        Session session = sessionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Session not found with id: " + id));
        
        sessionRepository.delete(session);
    }
    
    private SessionResponse convertToResponse(Session session) {
        List<SessionResponse.VideoResponse> videoResponses = session.getVideos() != null
            ? session.getVideos().stream()
                .map(v -> new SessionResponse.VideoResponse(v.getId(), v.getTitle(), v.getYoutubeUrl(), v.getVideoOrder()))
                .collect(Collectors.toList())
            : List.of();
        
        return new SessionResponse(
            session.getId(),
            session.getSessionName(),
            session.getPrice(),
            session.getSilverBadgeThreshold(),
            session.getBronzeBadgeThreshold(),
            session.getGoldBadgeThreshold(),
            session.getThumbnail(),
            videoResponses,
            session.getCreatedAt(),
            session.getUpdatedAt()
        );
    }
}
