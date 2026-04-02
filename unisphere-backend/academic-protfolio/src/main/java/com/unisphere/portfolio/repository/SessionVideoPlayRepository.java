package com.unisphere.portfolio.repository;

import com.unisphere.portfolio.entity.SessionVideoPlay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionVideoPlayRepository extends JpaRepository<SessionVideoPlay, Long> {
    
    // Count videos played by student in a session
    @Query("SELECT COUNT(svp) FROM SessionVideoPlay svp WHERE svp.student.id = :studentId AND svp.session.id = :sessionId")
    Long countVideoPlaysByStudentAndSession(@Param("studentId") Long studentId, @Param("sessionId") Long sessionId);
    
    // Check if student has played a specific video
    Optional<SessionVideoPlay> findByStudentIdAndSessionIdAndVideoId(Long studentId, Long sessionId, Long videoId);
    
    // Get all videos played by student in a session
    List<SessionVideoPlay> findByStudentIdAndSessionId(Long studentId, Long sessionId);
    
    // Get all plays for a student
    List<SessionVideoPlay> findByStudentId(Long studentId);
    
    // Get all plays for a session
    List<SessionVideoPlay> findBySessionId(Long sessionId);

    // Delete all plays for a specific video
    void deleteByVideoId(Long videoId);

    // Delete all plays for a list of video IDs
    @Query(value = "DELETE FROM session_video_plays WHERE video_id IN :videoIds", nativeQuery = true)
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    void deleteByVideoIdIn(@Param("videoIds") List<Long> videoIds);
}
