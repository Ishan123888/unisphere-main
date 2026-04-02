package com.unisphere.portfolio.repository;

import com.unisphere.portfolio.entity.StudentQuizResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentQuizResultRepository extends JpaRepository<StudentQuizResult, Long> {
    Optional<StudentQuizResult> findByStudentIdAndSessionId(Long studentId, Long sessionId);
    List<StudentQuizResult> findByStudentId(Long studentId);
    List<StudentQuizResult> findBySessionId(Long sessionId);
    boolean existsByStudentIdAndSessionId(Long studentId, Long sessionId);
}
