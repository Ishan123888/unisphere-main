package com.unisphere.portfolio.service.impl;

import com.unisphere.portfolio.dto.AdminCreateRequest;
import com.unisphere.portfolio.dto.AdminProfileUpdateRequest;
import com.unisphere.portfolio.dto.AdminResponse;
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
    private final AdminRepository adminRepository;

    // MANUAL CONSTRUCTOR (NO LOMBOK)
    public AdminServiceImpl(
            AchievementRepository achievementRepository,
            StudentRepository studentRepository,
            BadgeRepository badgeRepository,
            StudentBadgeRepository studentBadgeRepository,
            AdminRepository adminRepository
    ) {
        this.achievementRepository = achievementRepository;
        this.studentRepository = studentRepository;
        this.badgeRepository = badgeRepository;
        this.studentBadgeRepository = studentBadgeRepository;
        this.adminRepository = adminRepository;
    }

    @Override
    public List<Achievement> getPendingAchievements() {
        return achievementRepository.findByStatus(AchievementStatus.PENDING);
    }

    @Override
    public List<Achievement> getAllAchievements() {
        return achievementRepository.findAll();
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

    @Override
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @Override
    public AdminResponse getAdminProfile(Long adminId) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        return new AdminResponse(
                admin.getId(),
                admin.getUsername(),
                admin.getFullName(),
                admin.getEmail(),
                admin.getPhoneNumber(),
                admin.getProfilePictureUrl()
        );
    }

    @Override
    public AdminResponse updateAdminProfile(Long adminId, AdminProfileUpdateRequest request) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (request.getFullName() != null && !request.getFullName().isEmpty()) {
            admin.setFullName(request.getFullName());
        }
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            admin.setEmail(request.getEmail());
        }
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isEmpty()) {
            admin.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getProfilePictureUrl() != null && !request.getProfilePictureUrl().isEmpty()) {
            admin.setProfilePictureUrl(request.getProfilePictureUrl());
        }
        if (request.getDepartment() != null && !request.getDepartment().isEmpty()) {
            admin.setDepartment(request.getDepartment());
        }
        if (request.getDesignation() != null && !request.getDesignation().isEmpty()) {
            admin.setDesignation(request.getDesignation());
        }
        if (request.getBio() != null && !request.getBio().isEmpty()) {
            admin.setBio(request.getBio());
        }

        Admin updated = adminRepository.save(admin);

        return new AdminResponse(
                updated.getId(),
                updated.getUsername(),
                updated.getFullName(),
                updated.getEmail(),
                updated.getPhoneNumber(),
                updated.getProfilePictureUrl()
        );
    }

    @Override
    public AdminResponse createAdmin(AdminCreateRequest request) {
        if (adminRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        Admin admin = new Admin();
        admin.setUsername(request.getUsername());
        admin.setPassword(request.getPassword());
        admin.setFullName(request.getFullName());
        admin.setEmail(request.getEmail());
        admin.setPhoneNumber(request.getPhoneNumber());
        admin.setDepartment(request.getDepartment());
        admin.setDesignation(request.getDesignation());

        Admin saved = adminRepository.save(admin);

        return new AdminResponse(
                saved.getId(),
                saved.getUsername(),
                saved.getFullName(),
                saved.getEmail(),
                saved.getPhoneNumber(),
                saved.getProfilePictureUrl()
        );
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