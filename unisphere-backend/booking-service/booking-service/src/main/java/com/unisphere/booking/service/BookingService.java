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
    private final NotificationService notificationService;

    // 1. අලුත් බුකින් එකක් සේව් කිරීම
    public Booking createBooking(Booking booking) {
        // Default status එක PENDING ලෙස සෙට් කිරීම (අවශ්‍ය නම්)
        if (booking.getStatus() == null) {
            booking.setStatus(Booking.BookingStatus.PENDING);
        }
        Booking savedBooking = bookingRepository.save(booking);
        notificationService.sendBookingNotification(savedBooking);
        return savedBooking;
    }

    // 2. සියලුම බුකින් ලබා ගැනීම
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // 3. නිශ්චිත ස්ටේටස් එකක් අනුව බුකින් පෙරීම (Admin Dashboard එකට ඉතා වැදගත්)
    public List<Booking> getBookingsByStatus(String status) {
        try {
            Booking.BookingStatus bookingStatus = Booking.BookingStatus.valueOf(status.toUpperCase());
            return bookingRepository.findByStatus(bookingStatus);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status provided for filtering: " + status);
        }
    }

    // 4. ID එක අනුව සෙවීම
    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
    }

    // 5. බුකින් එකේ ස්ටේටස් එක වෙනස් කිරීම
    public Booking updateStatus(Long id, String status) {
        Booking booking = getBookingById(id);

        try {
            booking.setStatus(Booking.BookingStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + status + ". Use PENDING, CONFIRMED, CANCELLED, or COMPLETED.");
        }

        Booking updatedBooking = bookingRepository.save(booking);
        notificationService.sendBookingNotification(updatedBooking);
        return updatedBooking;
    }

    // 6. Admin Stats සඳහා අවශ්‍ය Count ලබා ගැනීම
    public long getTotalBookingCount() {
        return bookingRepository.count();
    }
}