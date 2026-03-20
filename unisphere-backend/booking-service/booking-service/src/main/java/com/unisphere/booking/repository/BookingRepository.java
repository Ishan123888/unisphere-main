package com.unisphere.booking.repository;

import com.unisphere.booking.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // 1. ශිෂ්‍යයාගේ ID එක අනුව කරපු බුකින් ටික සෙවීමට
    List<Booking> findByStudentId(Long studentId);

    // 2. ටියුටර්ගේ ID එක අනුව එයාට ලැබුණු බුකින් ටික සෙවීමට
    List<Booking> findByTutorId(Long tutorId);

    // 3. Status එක (PENDING, CONFIRMED etc.) අනුව බුකින් පෙරීමට
    // Admin Dashboard එකේ "Pending Approvals" පෙන්වීමට මෙය අත්‍යවශ්‍ය වේ.
    List<Booking> findByStatus(Booking.BookingStatus status);
}