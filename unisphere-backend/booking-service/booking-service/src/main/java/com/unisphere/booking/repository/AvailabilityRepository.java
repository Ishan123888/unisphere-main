package com.unisphere.booking.repository;

import com.unisphere.booking.model.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long> {

    List<Availability> findByTutorId(Long tutorId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Availability a WHERE a.tutorId = :tutorId")
    void deleteByTutorId(@Param("tutorId") Long tutorId);
}