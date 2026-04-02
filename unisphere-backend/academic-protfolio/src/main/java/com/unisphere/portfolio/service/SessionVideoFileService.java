package com.unisphere.portfolio.service;

import com.unisphere.portfolio.dto.SessionVideoFileRequest;
import com.unisphere.portfolio.dto.SessionVideoFileResponse;
import com.unisphere.portfolio.entity.SessionVideoFile;

import java.util.List;

public interface SessionVideoFileService {
    SessionVideoFileResponse uploadVideoFile(SessionVideoFileRequest request);
    List<SessionVideoFileResponse> getSessionVideoFiles(Long sessionId);
    SessionVideoFile getVideoFileById(Long id);
    void deleteVideoFile(Long id);
}
