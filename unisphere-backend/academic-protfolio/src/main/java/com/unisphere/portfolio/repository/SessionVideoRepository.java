package com.unisphere.portfolio.repository;

import com.unisphere.portfolio.entity.SessionVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SessionVideoRepository extends JpaRepository<SessionVideo, Long> {
    List<SessionVideo> findBySessionIdOrderByVideoOrder(Long sessionId);
}
