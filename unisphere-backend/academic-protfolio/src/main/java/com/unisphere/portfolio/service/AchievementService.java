package com.unisphere.portfolio.service;

import com.unisphere.portfolio.entity.Achievement;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AchievementService {
    Achievement createAchievement(Long studentId, String title, String category, String description,
                                  String institution, String level, String achievementDate,
                                  MultipartFile file);

    List<Achievement> getAllAchievementsByStudent(Long studentId);

    Achievement getAchievementById(Long id);

    Achievement updateAchievement(Long id, Long studentId, String title, String category, String description,
                                  String institution, String level, String achievementDate,
                                  MultipartFile file);

    void deleteAchievement(Long id);
}