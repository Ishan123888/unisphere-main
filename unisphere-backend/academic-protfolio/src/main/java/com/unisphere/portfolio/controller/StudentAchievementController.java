package com.unisphere.portfolio.controller;

import com.unisphere.portfolio.entity.Achievement;
import com.unisphere.portfolio.service.AchievementService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student/achievements")
public class StudentAchievementController {

    private final AchievementService achievementService;

    public StudentAchievementController(AchievementService achievementService) {
        this.achievementService = achievementService;
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Achievement> createAchievement(
            @RequestParam @NotNull Long studentId,
            @RequestParam @NotBlank String title,
            @RequestParam @NotBlank String category,
            @RequestParam @NotBlank String description,
            @RequestParam @NotBlank String institution,
            @RequestParam @NotBlank String level,
            @RequestParam @NotBlank String achievementDate,
            @RequestParam(required = false) MultipartFile file
    ) {
        return ResponseEntity.ok(
                achievementService.createAchievement(
                        studentId, title, category, description, institution, level, achievementDate, file
                )
        );
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Achievement>> getStudentAchievements(@PathVariable Long studentId) {
        return ResponseEntity.ok(achievementService.getAllAchievementsByStudent(studentId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Achievement> getAchievementById(@PathVariable Long id) {
        return ResponseEntity.ok(achievementService.getAchievementById(id));
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<Achievement> updateAchievement(
            @PathVariable Long id,
            @RequestParam @NotNull Long studentId,
            @RequestParam @NotBlank String title,
            @RequestParam @NotBlank String category,
            @RequestParam @NotBlank String description,
            @RequestParam @NotBlank String institution,
            @RequestParam @NotBlank String level,
            @RequestParam @NotBlank String achievementDate,
            @RequestParam(required = false) MultipartFile file
    ) {
        return ResponseEntity.ok(
                achievementService.updateAchievement(
                        id, studentId, title, category, description, institution, level, achievementDate, file
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteAchievement(@PathVariable Long id) {
        achievementService.deleteAchievement(id);
        return ResponseEntity.ok(Map.of("message", "Achievement deleted successfully"));
    }
}