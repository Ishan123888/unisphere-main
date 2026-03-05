package com.unisphere.booking.service;

import com.unisphere.booking.model.Booking;
import com.unisphere.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService; // NotificationService එක මෙතනට සම්බන්ධ කළා

    // අලුත් බුකින් එකක් සේව් කරන මෙතඩ් එක
    public Booking createBooking(Booking booking) {
        Booking savedBooking = bookingRepository.save(booking);
        // අලුත් බුකින් එකක් හැදුණු බව දැනුම් දීම
        notificationService.sendBookingNotification(savedBooking);
        return savedBooking;
    }

    // හැම බුකින් එකක්ම ගන්න
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // ID එක අනුව බුකින් එකක් හොයන්න
    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
    }

    // බුකින් එකේ ස්ටේටස් එක වෙනස් කිරීම (Confirm/Cancel)
    public Booking updateStatus(Long id, String status) {
        Booking booking = getBookingById(id);

        try {
            // String එක Enum එකකට හරවන නිවැරදි ක්‍රමය
            booking.setStatus(Booking.BookingStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + status + ". Use PENDING, CONFIRMED, CANCELLED, or COMPLETED.");
        }

        Booking updatedBooking = bookingRepository.save(booking);

        // ස්ටේටස් එක මාරු වුණු බව දැනුම් දීම (Email Trigger)
        notificationService.sendBookingNotification(updatedBooking);

        return updatedBooking;
    }
}