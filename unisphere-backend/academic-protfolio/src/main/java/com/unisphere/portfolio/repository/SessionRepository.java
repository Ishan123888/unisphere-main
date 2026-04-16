package com.unisphere.portfolio.repository;

import com.unisphere.portfolio.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    Optional<Session> findBySessionName(String sessionName);
    List<Session> findAllByOrderByCreatedAtDesc();
}
