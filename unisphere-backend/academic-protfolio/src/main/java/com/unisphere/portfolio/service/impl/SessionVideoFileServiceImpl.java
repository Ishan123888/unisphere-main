package com.unisphere.portfolio.service.impl;

import com.unisphere.portfolio.dto.SessionVideoFileRequest;
import com.unisphere.portfolio.dto.SessionVideoFileResponse;
import com.unisphere.portfolio.entity.Session;
import com.unisphere.portfolio.entity.SessionVideoFile;
import com.unisphere.portfolio.repository.SessionRepository;
import com.unisphere.portfolio.repository.SessionVideoFileRepository;
import com.unisphere.portfolio.service.SessionVideoFileService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SessionVideoFileServiceImpl implements SessionVideoFileService {

    private final SessionVideoFileRepository videoFileRepository;
    private final SessionRepository sessionRepository;

    public SessionVideoFileServiceImpl(SessionVideoFileRepository videoFileRepository,
                                      SessionRepository sessionRepository) {
        this.videoFileRepository = videoFileRepository;
        this.sessionRepository = sessionRepository;
    }

    @Override
    public SessionVideoFileResponse uploadVideoFile(SessionVideoFileRequest request) {
        try {
            System.out.println("Starting video file upload: sessionId=" + request.getSessionId() + 
                             ", title=" + request.getTitle() + 
                             ", filePath=" + request.getFilePath());
            
            // Verify session exists
            Session session = sessionRepository.findById(request.getSessionId())
                    .orElseThrow(() -> {
                        String msg = "Session not found with ID: " + request.getSessionId();
                        System.err.println(msg);
                        return new RuntimeException(msg);
                    });

            System.out.println("Session found: " + session.getSessionName());

            // Create video file entity
            SessionVideoFile videoFile = new SessionVideoFile(
                    session,
                    request.getTitle(),
                    request.getSubtitle(),
                    request.getFilePath(),
                    request.getFileName(),
                    request.getFileSize(),
                    request.getMimeType()
            );

            System.out.println("Saving video file to database...");
            
            // Save to database
            SessionVideoFile savedFile = videoFileRepository.save(videoFile);
            
            System.out.println("Video file saved successfully with ID: " + savedFile.getId());

            // Create response
            SessionVideoFileResponse response = new SessionVideoFileResponse(
                    savedFile.getId(),
                    savedFile.getSession().getId(),
                    savedFile.getTitle(),
                    savedFile.getSubtitle(),
                    savedFile.getFileName(),
                    savedFile.getFilePath(),
                    savedFile.getFileSize(),
                    savedFile.getMimeType(),
                    savedFile.getCreatedAt()
            );
            
            System.out.println("Returning response: " + response.getId());
            return response;
        } catch (Exception e) {
            System.err.println("Error in uploadVideoFile: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to save video file to database: " + e.getMessage(), e);
        }
    }

    @Override
    public List<SessionVideoFileResponse> getSessionVideoFiles(Long sessionId) {
        try {
            return videoFileRepository.findBySessionId(sessionId)
                    .stream()
                    .map(file -> new SessionVideoFileResponse(
                            file.getId(),
                            file.getSession().getId(),
                            file.getTitle(),
                            file.getSubtitle(),
                            file.getFileName(),
                            file.getFilePath(),
                            file.getFileSize(),
                            file.getMimeType(),
                            file.getCreatedAt()
                    ))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error getting session video files: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to get video files: " + e.getMessage(), e);
        }
    }

    @Override
    public SessionVideoFile getVideoFileById(Long id) {
        try {
            return videoFileRepository.findById(id)
                    .orElseThrow(() -> {
                        String msg = "Video file not found with ID: " + id;
                        System.err.println(msg);
                        return new RuntimeException(msg);
                    });
        } catch (Exception e) {
            System.err.println("Error getting video file by ID: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to get video file: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteVideoFile(Long id) {
        try {
            if (!videoFileRepository.existsById(id)) {
                throw new RuntimeException("Video file not found with ID: " + id);
            }
            videoFileRepository.deleteById(id);
            System.out.println("Video file deleted successfully: " + id);
        } catch (Exception e) {
            System.err.println("Error deleting video file: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to delete video file: " + e.getMessage(), e);
        }
    }
}
