package com.unisphere.booking.repository;

import com.unisphere.booking.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("SELECT b FROM Booking b WHERE b.studentUsername = :username ORDER BY b.createdAt DESC")
    List<Booking> findByStudentUsernameOrderByCreatedAtDesc(@Param("username") String username);

    @Query("SELECT b FROM Booking b WHERE b.tutorId = :tutorId ORDER BY b.createdAt DESC")
    List<Booking> findByTutorIdOrderByCreatedAtDesc(@Param("tutorId") Long tutorId);

    @Query("SELECT b FROM Booking b ORDER BY b.createdAt DESC")
    List<Booking> findAllByOrderByCreatedAtDesc();

    @Query("SELECT b FROM Booking b WHERE b.status = :status")
    List<Booking> findByStatus(@Param("status") Booking.BookingStatus status);
}