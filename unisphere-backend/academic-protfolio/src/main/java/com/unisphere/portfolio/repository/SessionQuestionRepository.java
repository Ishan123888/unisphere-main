package com.unisphere.portfolio.repository;

import com.unisphere.portfolio.entity.SessionQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SessionQuestionRepository extends JpaRepository<SessionQuestion, Long> {
    List<SessionQuestion> findBySessionId(Long sessionId);
    void deleteBySessionId(Long sessionId);
}
