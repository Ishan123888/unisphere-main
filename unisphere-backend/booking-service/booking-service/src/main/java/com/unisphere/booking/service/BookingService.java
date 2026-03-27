package com.unisphere.booking.service;

import com.unisphere.booking.model.Booking;
import com.unisphere.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    /* ── Create booking ─────────────────────────────────────────── */
    public Booking createBooking(Booking booking) {
        // Generate unique booking ref
        if (booking.getBookingRef() == null || booking.getBookingRef().isEmpty()) {
            booking.setBookingRef("UNI-" + String.format("%03d",
                    (int)(bookingRepository.count() + 1)));
        }
        booking.setStatus(Booking.BookingStatus.PENDING);
        Booking saved = bookingRepository.save(booking);
        notificationService.notifyBookingCreated(saved);
        return saved;
    }

    /* ── Get by student username ────────────────────────────────── */
    public List<Booking> getBookingsByStudentUsername(String username) {
        return bookingRepository.findByStudentUsernameOrderByCreatedAtDesc(username);
    }

    /* ── Get by tutor ID ────────────────────────────────────────── */
    public List<Booking> getBookingsByTutorId(Long tutorId) {
        return bookingRepository.findByTutorIdOrderByCreatedAtDesc(tutorId);
    }

    /* ── Get all bookings ───────────────────────────────────────── */
    public List<Booking> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc();
    }

    /* ── Get by ID ──────────────────────────────────────────────── */
    public Optional<Booking> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }

    /* ── Update status ──────────────────────────────────────────── */
    public Booking updateStatus(Long id, String status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + id));
        booking.setStatus(Booking.BookingStatus.valueOf(status.toUpperCase()));
        Booking updated = bookingRepository.save(booking);
        notificationService.notifyStatusChange(updated);
        return updated;
    }

    /* ── Cancel booking ─────────────────────────────────────────── */
    public Booking cancelBooking(Long id) {
        return updateStatus(id, "CANCELLED");
    }
}