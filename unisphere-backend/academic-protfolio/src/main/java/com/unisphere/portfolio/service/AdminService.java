package com.unisphere.portfolio.service;

import com.unisphere.portfolio.dto.AdminCreateRequest;
import com.unisphere.portfolio.dto.AdminProfileUpdateRequest;
import com.unisphere.portfolio.dto.AdminResponse;
import com.unisphere.portfolio.entity.Achievement;
import com.unisphere.portfolio.entity.Admin;
import com.unisphere.portfolio.entity.Student;
import com.unisphere.portfolio.entity.StudentBadge;

import java.util.List;

public interface AdminService {
    List<Achievement> getPendingAchievements();
    List<Achievement> getAllAchievements();
    Achievement approveAchievement(Long id, String adminComment);
    Achievement rejectAchievement(Long id, String adminComment);
    List<StudentBadge> getStudentBadges(Long studentId);
    Student suspendStudent(Long studentId);
    List<Student> getAllStudents();
    AdminResponse getAdminProfile(Long adminId);
    AdminResponse updateAdminProfile(Long adminId, AdminProfileUpdateRequest request);
    AdminResponse createAdmin(AdminCreateRequest request);
}