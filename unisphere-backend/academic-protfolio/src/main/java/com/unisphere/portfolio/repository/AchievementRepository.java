package com.unisphere.portfolio.repository;

import com.unisphere.portfolio.entity.Achievement;
import com.unisphere.portfolio.entity.AchievementStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    List<Achievement> findByStudentId(Long studentId);
    List<Achievement> findByStatus(AchievementStatus status);
    long countByStudentIdAndStatus(Long studentId, AchievementStatus status);
}