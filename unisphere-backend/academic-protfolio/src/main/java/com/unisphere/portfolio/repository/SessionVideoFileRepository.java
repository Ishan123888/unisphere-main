package com.unisphere.portfolio.repository;

import com.unisphere.portfolio.entity.SessionVideoFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface SessionVideoFileRepository extends JpaRepository<SessionVideoFile, Long> {
    List<SessionVideoFile> findBySessionId(Long sessionId);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM session_video_files WHERE id = :id", nativeQuery = true)
    void deleteByIdNative(@Param("id") Long id);
}
