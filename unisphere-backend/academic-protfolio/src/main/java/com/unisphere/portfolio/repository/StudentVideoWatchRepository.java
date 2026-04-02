package com.unisphere.portfolio.repository;

import com.unisphere.portfolio.entity.StudentVideoWatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StudentVideoWatchRepository extends JpaRepository<StudentVideoWatch, Long> {
    boolean existsByStudentIdAndVideoFileId(Long studentId, Long videoFileId);

    @Query("SELECT w.videoFile.id FROM StudentVideoWatch w WHERE w.student.id = :studentId AND w.videoFile.session.id = :sessionId")
    List<Long> findWatchedVideoIdsByStudentAndSession(@Param("studentId") Long studentId, @Param("sessionId") Long sessionId);

    void deleteByVideoFileId(Long videoFileId);
}
