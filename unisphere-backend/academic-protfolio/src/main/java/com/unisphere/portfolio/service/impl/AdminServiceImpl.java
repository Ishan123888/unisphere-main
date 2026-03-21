package com.unisphere.portfolio.service.impl;

import com.unisphere.portfolio.entity.*;
import com.unisphere.portfolio.repository.*;
import com.unisphere.portfolio.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final AchievementRepository achievementRepository;
    private final StudentRepository studentRepository;
    private final BadgeRepository badgeRepository;
    private final StudentBadgeRepository studentBadgeRepository;

    @Override
    public List<Achievement> getPendingAchievements() {
        return achievementRepository.findByStatus(AchievementStatus.PENDING);
    }

    @Override
    public Achievement approveAchievement(Long id, String adminComment) {
        Achievement achievement = achievementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Achievement not found"));

        achievement.setStatus(AchievementStatus.APPROVED);
        achievement.setAdminComment(adminComment);
        achievement.setUpdatedAt(LocalDateTime.now());

        Achievement saved = achievementRepository.save(achievement);
        autoAssignBadge(saved.getStudent().getId());

        return saved;
    }

    @Override
    public Achievement rejectAchievement(Long id, String adminComment) {
        Achievement achievement = achievementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Achievement not found"));

        achievement.setStatus(AchievementStatus.REJECTED);
        achievement.setAdminComment(adminComment);
        achievement.setUpdatedAt(LocalDateTime.now());

        return achievementRepository.save(achievement);
    }

    @Override
    public List<StudentBadge> getStudentBadges(Long studentId) {
        return studentBadgeRepository.findByStudentId(studentId);
    }

    @Override
    public Student suspendStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        student.setStatus(UserStatus.SUSPENDED);
        return studentRepository.save(student);
    }

    private void autoAssignBadge(Long studentId) {
        long approvedCount = achievementRepository.countByStudentIdAndStatus(studentId, AchievementStatus.APPROVED);

        if (approvedCount >= 5) {
            Badge badge = badgeRepository.findByBadgeName("Verified Achiever")
                    .orElseGet(() -> badgeRepository.save(
                            Badge.builder()
                                    .badgeName("Verified Achiever")
                                    .description("Awarded after 5 approved achievements")
                                    .build()
                    ));

            boolean alreadyExists = studentBadgeRepository.existsByStudentIdAndBadgeId(studentId, badge.getId());

            if (!alreadyExists) {
                Student student = studentRepository.findById(studentId)
                        .orElseThrow(() -> new RuntimeException("Student not found"));

                StudentBadge studentBadge = StudentBadge.builder()
                        .student(student)
                        .badge(badge)
                        .assignedAt(LocalDateTime.now())
                        .build();

                studentBadgeRepository.save(studentBadge);
            }
        }
    }
}