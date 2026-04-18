package com.unisphere.portfolio.service;

import com.unisphere.portfolio.dto.SessionRequest;
import com.unisphere.portfolio.dto.SessionResponse;
import com.unisphere.portfolio.entity.Session;
import com.unisphere.portfolio.entity.SessionVideo;
import com.unisphere.portfolio.repository.SessionRepository;
import com.unisphere.portfolio.repository.SessionVideoPlayRepository;
import com.unisphere.portfolio.repository.SessionVideoRepository;
import com.unisphere.portfolio.service.impl.SessionServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("SessionService Tests")
class SessionServiceImplTest {

    @Mock private SessionRepository sessionRepository;
    @Mock private SessionVideoRepository sessionVideoRepository;
    @Mock private SessionVideoPlayRepository sessionVideoPlayRepository;

    @InjectMocks
    private SessionServiceImpl sessionService;

    private Session session;
    private SessionRequest request;

    @BeforeEach
    void setUp() {
        session = new Session("Java Basics", new BigDecimal("1500"), 3, 2, 5);
        session.setId(1L);
        session.setVideos(new ArrayList<>());

        request = new SessionRequest();
        request.setSessionName("Java Basics");
        request.setPrice(new BigDecimal("1500"));
        request.setSilverBadgeThreshold(3);
        request.setBronzeBadgeThreshold(2);
        request.setGoldBadgeThreshold(5);
        request.setThumbnail("thumb.jpg");
    }

    @Test
    @DisplayName("Create session without videos succeeds")
    void createSession_noVideos_success() {
        when(sessionRepository.save(any(Session.class))).thenReturn(session);

        SessionResponse response = sessionService.createSession(request);

        assertNotNull(response);
        assertEquals("Java Basics", response.getSessionName());
        assertEquals(new BigDecimal("1500"), response.getPrice());
        verify(sessionRepository, times(1)).save(any(Session.class));
    }

    @Test
    @DisplayName("Create session with videos saves videos")
    void createSession_withVideos_savesVideos() {
        SessionRequest.VideoRequest video = new SessionRequest.VideoRequest();
        video.setTitle("Intro to Java");
        video.setYoutubeUrl("https://youtube.com/watch?v=abc");
        request.setVideos(List.of(video));

        SessionVideo savedVideo = new SessionVideo(session, "Intro to Java", "https://youtube.com/watch?v=abc", 1);
        savedVideo.setId(1L);

        when(sessionRepository.save(any(Session.class))).thenReturn(session);
        when(sessionVideoRepository.saveAll(any())).thenReturn(List.of(savedVideo));

        SessionResponse response = sessionService.createSession(request);

        assertNotNull(response);
        verify(sessionVideoRepository, times(1)).saveAll(any());
    }

    @Test
    @DisplayName("Get session by ID returns session")
    void getSessionById_exists_returnsSession() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(sessionVideoRepository.findBySessionIdOrderByVideoOrder(1L)).thenReturn(List.of());

        SessionResponse response = sessionService.getSessionById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Java Basics", response.getSessionName());
    }

    @Test
    @DisplayName("Get session by ID throws when not found")
    void getSessionById_notFound_throwsException() {
        when(sessionRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> sessionService.getSessionById(99L));
        assertTrue(ex.getMessage().contains("Session not found"));
    }

    @Test
    @DisplayName("Get all sessions returns list")
    void getAllSessions_returnsList() {
        when(sessionRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(session));
        when(sessionVideoRepository.findBySessionIdOrderByVideoOrder(1L)).thenReturn(List.of());

        List<SessionResponse> result = sessionService.getAllSessions();

        assertEquals(1, result.size());
        assertEquals("Java Basics", result.get(0).getSessionName());
    }

    @Test
    @DisplayName("Delete session succeeds when session exists")
    void deleteSession_exists_success() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        assertDoesNotThrow(() -> sessionService.deleteSession(1L));
        verify(sessionRepository, times(1)).delete(session);
    }

    @Test
    @DisplayName("Delete session throws when not found")
    void deleteSession_notFound_throwsException() {
        when(sessionRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> sessionService.deleteSession(99L));
        assertTrue(ex.getMessage().contains("Session not found"));
    }

    @Test
    @DisplayName("Update session updates fields correctly")
    void updateSession_validData_updatesFields() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(sessionRepository.saveAndFlush(any())).thenReturn(session);
        when(sessionRepository.save(any())).thenReturn(session);

        SessionRequest updateRequest = new SessionRequest();
        updateRequest.setSessionName("Advanced Java");
        updateRequest.setPrice(new BigDecimal("2000"));
        updateRequest.setSilverBadgeThreshold(4);
        updateRequest.setBronzeBadgeThreshold(3);
        updateRequest.setGoldBadgeThreshold(6);
        updateRequest.setThumbnail("new-thumb.jpg");

        SessionResponse response = sessionService.updateSession(1L, updateRequest);

        assertNotNull(response);
        verify(sessionRepository, times(1)).save(any(Session.class));
    }
}
