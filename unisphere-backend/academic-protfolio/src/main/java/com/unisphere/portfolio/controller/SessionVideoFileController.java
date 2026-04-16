package com.unisphere.portfolio.controller;

import com.unisphere.portfolio.dto.SessionVideoFileRequest;
import com.unisphere.portfolio.dto.SessionVideoFileResponse;
import com.unisphere.portfolio.entity.SessionVideoFile;
import com.unisphere.portfolio.entity.Student;
import com.unisphere.portfolio.entity.StudentVideoWatch;
import com.unisphere.portfolio.repository.SessionVideoFileRepository;
import com.unisphere.portfolio.repository.StudentRepository;
import com.unisphere.portfolio.repository.StudentVideoWatchRepository;
import com.unisphere.portfolio.service.SessionVideoFileService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/session-video-files")
public class SessionVideoFileController {

    private final SessionVideoFileService videoFileService;
    private final StudentVideoWatchRepository watchRepo;
    private final StudentRepository studentRepo;
    private final SessionVideoFileRepository videoFileRepo;
    private static final String UPLOAD_DIR = "uploads/videos";

    @PersistenceContext
    private EntityManager entityManager;

    public SessionVideoFileController(SessionVideoFileService videoFileService,
                                      StudentVideoWatchRepository watchRepo,
                                      StudentRepository studentRepo,
                                      SessionVideoFileRepository videoFileRepo) {
        this.videoFileService = videoFileService;
        this.watchRepo = watchRepo;
        this.studentRepo = studentRepo;
        this.videoFileRepo = videoFileRepo;
    }

    @PostMapping("/upload")
    public ResponseEntity<SessionVideoFileResponse> uploadVideoFile(
            @RequestParam Long sessionId,
            @RequestParam String title,
            @RequestParam String subtitle,
            @RequestParam("file") MultipartFile file) {
        try {
            System.out.println("=== Video Upload Request ===");
            System.out.println("SessionId: " + sessionId);
            System.out.println("Title: " + title);
            System.out.println("Subtitle: " + subtitle);
            System.out.println("File: " + file.getOriginalFilename() + " (" + file.getSize() + " bytes)");
            
            // Validate inputs
            if (file.isEmpty()) {
                throw new RuntimeException("File is empty");
            }
            
            if (sessionId == null || sessionId <= 0) {
                throw new RuntimeException("Invalid session ID: " + sessionId);
            }

            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath();
            System.out.println("Upload directory: " + uploadPath);
            Files.createDirectories(uploadPath);

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.isEmpty()) {
                throw new RuntimeException("Invalid filename");
            }
            
            String fileExtension = originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                : "";
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
            Path filePath = uploadPath.resolve(uniqueFilename);

            System.out.println("Saving file to: " + filePath);
            
            // Save file to disk
            Files.write(filePath, file.getBytes());
            
            System.out.println("File saved successfully");

            // Create request with RELATIVE file path (not absolute)
            // Store relative path like: uploads/videos/filename.mp4
            String relativeFilePath = UPLOAD_DIR + "/" + uniqueFilename;
            System.out.println("Relative file path to store: " + relativeFilePath);
            System.out.println("Full file path on disk: " + filePath.toAbsolutePath());
            
            SessionVideoFileRequest request = new SessionVideoFileRequest(
                    sessionId,
                    title,
                    subtitle,
                    relativeFilePath,
                    originalFilename,
                    file.getSize(),
                    file.getContentType() != null ? file.getContentType() : "video/mp4"
            );

            System.out.println("Calling service to save to database...");
            SessionVideoFileResponse response = videoFileService.uploadVideoFile(request);
            
            System.out.println("Upload completed successfully. Response ID: " + response.getId());
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            System.err.println("IO Error during video upload: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to upload video file: " + e.getMessage(), e);
        } catch (Exception e) {
            System.err.println("Error during video upload: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error uploading video: " + e.getMessage(), e);
        }
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<SessionVideoFileResponse>> getSessionVideoFiles(
            @PathVariable Long sessionId) {
        List<SessionVideoFileResponse> files = videoFileService.getSessionVideoFiles(sessionId);
        return ResponseEntity.ok(files);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadVideoFile(@PathVariable Long id) {
        try {
            System.out.println("=== Video Download Request ===");
            System.out.println("Video ID: " + id);
            
            SessionVideoFile videoFile = videoFileService.getVideoFileById(id);
            System.out.println("Video found: " + videoFile.getFileName());
            System.out.println("File path from DB: " + videoFile.getFilePath());
            
            Path filePath = Paths.get(videoFile.getFilePath());
            
            // If path is relative, make it absolute by resolving from current directory
            if (!filePath.isAbsolute()) {
                System.out.println("Path is relative, resolving to absolute path");
                filePath = Paths.get(UPLOAD_DIR).toAbsolutePath().resolve(videoFile.getFilePath());
            }
            
            System.out.println("Absolute path: " + filePath.toAbsolutePath());
            
            if (!Files.exists(filePath)) {
                System.err.println("File not found at: " + filePath.toAbsolutePath());
                throw new RuntimeException("Video file not found on disk: " + videoFile.getFilePath());
            }
            
            System.out.println("File exists, reading...");
            byte[] fileContent = Files.readAllBytes(filePath);
            System.out.println("File read successfully, size: " + fileContent.length + " bytes");

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + videoFile.getFileName() + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, videoFile.getMimeType())
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(fileContent.length))
                    .body(fileContent);
        } catch (IOException e) {
            System.err.println("IO Error during download: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to read video file: " + e.getMessage(), e);
        } catch (Exception e) {
            System.err.println("Error during download: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error downloading video: " + e.getMessage(), e);
        }
    }

    @GetMapping("/stream/{id}")
    public ResponseEntity<byte[]> streamVideoFile(@PathVariable Long id) {
        try {
            System.out.println("=== Video Stream Request ===");
            System.out.println("Video ID: " + id);
            
            SessionVideoFile videoFile = videoFileService.getVideoFileById(id);
            System.out.println("File path from DB: " + videoFile.getFilePath());
            
            Path filePath = Paths.get(videoFile.getFilePath());
            
            // If path is relative, make it absolute by resolving from current directory
            if (!filePath.isAbsolute()) {
                System.out.println("Path is relative, resolving to absolute path");
                filePath = Paths.get(UPLOAD_DIR).toAbsolutePath().resolve(videoFile.getFilePath());
            }
            
            System.out.println("Absolute path: " + filePath.toAbsolutePath());
            
            if (!Files.exists(filePath)) {
                System.err.println("File not found at: " + filePath.toAbsolutePath());
                throw new RuntimeException("Video file not found on disk: " + videoFile.getFilePath());
            }
            
            System.out.println("File exists, reading...");
            byte[] fileContent = Files.readAllBytes(filePath);
            System.out.println("File read successfully, size: " + fileContent.length + " bytes");

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, videoFile.getMimeType())
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(fileContent.length))
                    .header("Accept-Ranges", "bytes")
                    .body(fileContent);
        } catch (IOException e) {
            System.err.println("IO Error during stream: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to stream video file: " + e.getMessage(), e);
        } catch (Exception e) {
            System.err.println("Error during stream: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error streaming video: " + e.getMessage(), e);
        }
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteVideoFile(@PathVariable Long id) {
        try {
            // Get file path using native SQL — no entity loading, no cascade
            String filePath = (String) entityManager
                .createNativeQuery("SELECT file_path FROM session_video_files WHERE id = :id")
                .setParameter("id", id)
                .getSingleResult();

            // Delete file from disk
            if (filePath != null) {
                Path path = Paths.get(filePath);
                if (!path.isAbsolute()) {
                    path = Paths.get(UPLOAD_DIR).toAbsolutePath().resolve(filePath);
                }
                Files.deleteIfExists(path);
            }

            // Delete child records first, then the file record — all native SQL
            entityManager.createNativeQuery("DELETE FROM student_video_watches WHERE video_file_id = :id")
                .setParameter("id", id).executeUpdate();

            entityManager.createNativeQuery("DELETE FROM session_video_files WHERE id = :id")
                .setParameter("id", id).executeUpdate();

            return ResponseEntity.noContent().build();
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete video file: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Error deleting video file: " + e.getMessage(), e);
        }
    }

    // Mark a video as watched by a student
    @PostMapping("/{videoId}/watch/{studentId}")
    public ResponseEntity<Map<String, Object>> markWatched(@PathVariable Long videoId,
                                                            @PathVariable Long studentId) {
        if (watchRepo.existsByStudentIdAndVideoFileId(studentId, videoId)) {
            return ResponseEntity.ok(Map.of("success", true, "alreadyWatched", true));
        }
        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        SessionVideoFile videoFile = videoFileRepo.findById(videoId)
                .orElseThrow(() -> new RuntimeException("Video not found"));
        watchRepo.save(new StudentVideoWatch(student, videoFile));

        // Count total watched videos for this session and check badge thresholds
        Long sessionId = videoFile.getSession().getId();
        long watchCount = watchRepo.findWatchedVideoIdsByStudentAndSession(studentId, sessionId).size();
        com.unisphere.portfolio.entity.Session session = videoFile.getSession();

        String badgeEarned = null;
        boolean isNewBadge = false;
        if (watchCount >= session.getGoldBadgeThreshold()) {
            badgeEarned = "GOLD";
        } else if (watchCount >= session.getSilverBadgeThreshold()) {
            badgeEarned = "SILVER";
        } else if (watchCount >= session.getBronzeBadgeThreshold()) {
            badgeEarned = "BRONZE";
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "alreadyWatched", false,
            "watchCount", watchCount,
            "badgeEarned", badgeEarned != null ? badgeEarned : "",
            "sessionId", sessionId
        ));
    }

    // Get all watched video IDs for a student in a session
    @GetMapping("/session/{sessionId}/student/{studentId}/watched")
    public ResponseEntity<List<Long>> getWatchedVideoIds(@PathVariable Long sessionId,
                                                          @PathVariable Long studentId) {
        return ResponseEntity.ok(watchRepo.findWatchedVideoIdsByStudentAndSession(studentId, sessionId));
    }
}
