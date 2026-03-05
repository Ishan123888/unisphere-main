package com.unisphere.booking.repository;

import com.unisphere.booking.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // ශිෂ්‍යයාගේ ID එක අනුව කරපු බුකින් ටික හොයන්න
    List<Booking> findByStudentId(Long studentId);

    // ටියුටර්ගේ ID එක අනුව එයාට ලැබුණු බුකින් ටික හොයන්න
    List<Booking> findByTutorId(Long tutorId);
}