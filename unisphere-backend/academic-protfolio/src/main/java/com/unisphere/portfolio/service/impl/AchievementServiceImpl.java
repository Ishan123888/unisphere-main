package com.unisphere.portfolio.service.impl;

import com.unisphere.portfolio.entity.*;
import com.unisphere.portfolio.repository.AchievementRepository;
import com.unisphere.portfolio.repository.StudentRepository;
import com.unisphere.portfolio.service.AchievementService;
import com.unisphere.portfolio.service.FileStorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AchievementServiceImpl implements AchievementService {

    private final AchievementRepository achievementRepository;
    private final StudentRepository studentRepository;
    private final FileStorageService fileStorageService;

    public AchievementServiceImpl(AchievementRepository achievementRepository,
                                  StudentRepository studentRepository,
                                  FileStorageService fileStorageService) {
        this.achievementRepository = achievementRepository;
        this.studentRepository = studentRepository;
        this.fileStorageService = fileStorageService;
    }

    @Override
    public Achievement createAchievement(Long studentId, String title, String category, String description,
                                         String institution, String level, String achievementDate,
                                         MultipartFile file) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getStatus() == UserStatus.SUSPENDED) {
            throw new RuntimeException("Suspended students cannot submit achievements");
        }

        validateFile(file);

        String fileUrl = fileStorageService.storeFile(file);

        Achievement achievement = new Achievement();

        achievement.setStudent(student);
        achievement.setTitle(title);
        achievement.setCategory(category);
        achievement.setDescription(description);
        achievement.setInstitution(institution);
        achievement.setLevel(level);
        achievement.setAchievementDate(LocalDate.parse(achievementDate));
        achievement.setCertificateFileName(file != null ? file.getOriginalFilename() : null);
        achievement.setCertificateUrl(fileUrl);
        achievement.setStatus(AchievementStatus.PENDING);
        achievement.setCreatedAt(LocalDateTime.now());
        achievement.setUpdatedAt(LocalDateTime.now());

        return achievementRepository.save(achievement);
    }

    @Override
    public List<Achievement> getAllAchievementsByStudent(Long studentId) {
        return achievementRepository.findByStudentId(studentId);
    }

    @Override
    public Achievement getAchievementById(Long id) {
        return achievementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Achievement not found"));
    }

    @Override
    public Achievement updateAchievement(Long id, Long studentId, String title, String category, String description,
                                         String institution, String level, String achievementDate,
                                         MultipartFile file) {

        Achievement achievement = getAchievementById(id);

        if (!achievement.getStudent().getId().equals(studentId)) {
            throw new RuntimeException("You can only update your own achievement");
        }

        validateFile(file);

        if (file != null && !file.isEmpty()) {
            String fileUrl = fileStorageService.storeFile(file);
            achievement.setCertificateFileName(file.getOriginalFilename());
            achievement.setCertificateUrl(fileUrl);
        }

        achievement.setTitle(title);
        achievement.setCategory(category);
        achievement.setDescription(description);
        achievement.setInstitution(institution);
        achievement.setLevel(level);
        achievement.setAchievementDate(LocalDate.parse(achievementDate));
        achievement.setStatus(AchievementStatus.PENDING);
        achievement.setAdminComment(null);
        achievement.setUpdatedAt(LocalDateTime.now());

        return achievementRepository.save(achievement);
    }

    @Override
    public void deleteAchievement(Long id) {
        Achievement achievement = getAchievementById(id);

        if (achievement.getStatus() == AchievementStatus.APPROVED) {
            throw new RuntimeException("Approved achievements cannot be deleted");
        }

        achievementRepository.deleteById(id);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return;
        }

        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        boolean validExtension = fileName.endsWith(".pdf")
                || fileName.endsWith(".jpg")
                || fileName.endsWith(".jpeg")
                || fileName.endsWith(".png");

        if (!validExtension) {
            throw new RuntimeException("Only PDF, JPG, JPEG, and PNG files are allowed");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("File size must be less than 5MB");
        }
    }
}