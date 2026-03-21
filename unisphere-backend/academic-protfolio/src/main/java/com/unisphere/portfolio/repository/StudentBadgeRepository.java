package com.unisphere.portfolio.repository;

import com.unisphere.portfolio.entity.StudentBadge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentBadgeRepository extends JpaRepository<StudentBadge, Long> {
    List<StudentBadge> findByStudentId(Long studentId);
    boolean existsByStudentIdAndBadgeId(Long studentId, Long badgeId);
}