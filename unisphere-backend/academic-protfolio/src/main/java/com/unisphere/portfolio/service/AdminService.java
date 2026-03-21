package com.unisphere.portfolio.service;

import com.unisphere.portfolio.entity.Achievement;
import com.unisphere.portfolio.entity.Student;
import com.unisphere.portfolio.entity.StudentBadge;

import java.util.List;

public interface AdminService {
    List<Achievement> getPendingAchievements();
    Achievement approveAchievement(Long id, String adminComment);
    Achievement rejectAchievement(Long id, String adminComment);
    List<StudentBadge> getStudentBadges(Long studentId);
    Student suspendStudent(Long studentId);
}