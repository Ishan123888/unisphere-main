package com.unisphere.portfolio.service;

import com.unisphere.portfolio.dto.SessionRequest;
import com.unisphere.portfolio.dto.SessionResponse;
import java.util.List;

public interface SessionService {
    SessionResponse createSession(SessionRequest request);
    SessionResponse getSessionById(Long id);
    List<SessionResponse> getAllSessions();
    SessionResponse updateSession(Long id, SessionRequest request);
    void deleteSession(Long id);
}
