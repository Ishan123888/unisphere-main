package com.unisphere.portfolio.repository;

import com.unisphere.portfolio.entity.SessionQuizConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SessionQuizConfigRepository extends JpaRepository<SessionQuizConfig, Long> {
    Optional<SessionQuizConfig> findBySessionId(Long sessionId);
}
