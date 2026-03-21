package com.unisphere.portfolio.service.impl;

import com.unisphere.portfolio.entity.*;
import com.unisphere.portfolio.repository.*;
import com.unisphere.portfolio.service.AdminService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminServiceImpl implements AdminService {

    private final AchievementRepository achievementRepository;
    private final StudentRepository studentRepository;
    private final BadgeRepository badgeRepository;
    private final StudentBadgeRepository studentBadgeRepository;

    // MANUAL CONSTRUCTOR (NO LOMBOK)
    public AdminServiceImpl(
            AchievementRepository achievementRepository,
            StudentRepository studentRepository,
            BadgeRepository badgeRepository,
            StudentBadgeRepository studentBadgeRepository
    ) {
        this.achievementRepository = achievementRepository;
        this.studentRepository = studentRepository;
        this.badgeRepository = badgeRepository;
        this.studentBadgeRepository = studentBadgeRepository;
    }

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

        //auto badge assign
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

    // FIXED METHOD (NO BUILDER)
    private void autoAssignBadge(Long studentId) {

        long approvedCount = achievementRepository
                .countByStudentIdAndStatus(studentId, AchievementStatus.APPROVED);

        if (approvedCount >= 5) {

            // ✅ create badge manually if not exists
            Badge badge = badgeRepository.findByBadgeName("Verified Achiever")
                    .orElseGet(() -> {
                        Badge newBadge = new Badge();
                        newBadge.setBadgeName("Verified Achiever");
                        newBadge.setDescription("Awarded after 5 approved achievements");
                        return badgeRepository.save(newBadge);
                    });

            boolean alreadyExists =
                    studentBadgeRepository.existsByStudentIdAndBadgeId(studentId, badge.getId());

            if (!alreadyExists) {

                Student student = studentRepository.findById(studentId)
                        .orElseThrow(() -> new RuntimeException("Student not found"));

                //create StudentBadge manually
                StudentBadge studentBadge = new StudentBadge();
                studentBadge.setStudent(student);
                studentBadge.setBadge(badge);
                studentBadge.setAssignedAt(LocalDateTime.now());

                studentBadgeRepository.save(studentBadge);
            }
        }
    }
}