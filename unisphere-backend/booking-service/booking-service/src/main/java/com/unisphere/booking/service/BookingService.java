package com.unisphere.booking.service;

import com.unisphere.booking.model.Booking;
import com.unisphere.booking.model.Availability; // 👈 අලුත් Entity එක
import com.unisphere.booking.model.Notification;
import com.unisphere.booking.repository.BookingRepository;
import com.unisphere.booking.repository.AvailabilityRepository; // 👈 අලුත් Repository එක
import com.unisphere.booking.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // 👈 Delete logic එකට ඕනේ

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final AvailabilityRepository availabilityRepository; // Inject availability repo
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /* ═══════════════════════════════════════════════════════════════
       1. TUTOR AVAILABILITY LOGIC (NEW)
       මෙතනින් තමයි Tutor ගේ Slots ටික පාලනය වෙන්නේ.
    ═══════════════════════════════════════════════════════════════ */

    @Transactional // Transactional එක අනිවාර්යයි පරණ ඒවා Delete කරලා අලුත් ඒවා දාන නිසා
    public void saveTutorAvailability(Long tutorId, List<Availability> availabilityList) {
        // 1. කලින් සේව් කරලා තිබුණු ඒ Tutor ට අදාළ ඔක්කොම Slots අයින් කරනවා
        availabilityRepository.deleteByTutorId(tutorId);

        // 2. අලුත් List එකේ තියෙන හැම Slot එකකටම Tutor ID එක සෙට් කරලා සේව් කරනවා
        availabilityList.forEach(availability -> {
            availability.setTutorId(tutorId);
            availabilityRepository.save(availability);
        });

        System.out.println("Saved " + availabilityList.size() + " slots for Tutor ID: " + tutorId);
    }

    public List<Availability> getTutorAvailability(Long tutorId) {
        return availabilityRepository.findByTutorId(tutorId);
    }

    /* ═══════════════════════════════════════════════════════════════
       2. CREATE NEW BOOKING
    ═══════════════════════════════════════════════════════════════ */
    public Booking createBooking(Booking booking) {
        if (booking.getScheduledSlot() == null) {
            throw new RuntimeException("Scheduled slot cannot be null.");
        }

        // පැය 2කට කලින් book කරන්න ඕනේ rule එක
        if (booking.getScheduledSlot().isBefore(LocalDateTime.now().plusHours(2))) {
            throw new RuntimeException("Bookings must be made at least 2 hours in advance.");
        }

        // දැනටමත් ඒ වෙලාවට වෙනත් Booking එකක් තියෙනවාදැයි බැලීම
        boolean isConflict = bookingRepository.existsByTutorIdAndScheduledSlotAndStatusNot(
                booking.getTutorId(),
                booking.getScheduledSlot(),
                Booking.BookingStatus.CANCELLED
        );
        if (isConflict) {
            throw new RuntimeException("Tutor is already booked for this time slot.");
        }

        // Booking Reference (UNI-0001) හැදීම
        if (booking.getBookingRef() == null || booking.getBookingRef().isEmpty()) {
            long count = bookingRepository.count();
            booking.setBookingRef("UNI-" + String.format("%04d", count + 1));
        }

        booking.setStatus(Booking.BookingStatus.PENDING);
        booking.setCreatedAt(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);

        sendNotification(
                String.valueOf(saved.getTutorId()),
                "New Booking Request! 📅",
                "New request for " + saved.getSubject() + " from " + saved.getStudentName(),
                "INFO"
        );

        return saved;
    }

    /* ═══════════════════════════════════════════════════════════════
       3. STATUS UPDATES (APPROVE, REJECT, COMPLETE, CANCEL)
    ═══════════════════════════════════════════════════════════════ */

    public Booking approveBooking(Long id) {
        Booking booking = findOrThrow(id);
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        Booking updated = bookingRepository.save(booking);

        sendNotification(updated.getStudentUsername(), "Booking Confirmed! ✅",
                "Your session " + updated.getBookingRef() + " is confirmed.", "SUCCESS");
        return updated;
    }

    public Booking rejectBooking(Long id, String reason) {
        Booking booking = findOrThrow(id);
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        Booking updated = bookingRepository.save(booking);

        String msg = "Your booking " + updated.getBookingRef() + " was rejected.";
        if (reason != null && !reason.isBlank()) msg += " Reason: " + reason;

        sendNotification(updated.getStudentUsername(), "Booking Rejected ❌", msg, "ERROR");
        return updated;
    }

    public Booking completeBooking(Long id) {
        Booking booking = findOrThrow(id);
        booking.setStatus(Booking.BookingStatus.COMPLETED);
        Booking updated = bookingRepository.save(booking);

        sendNotification(updated.getStudentUsername(), "Session Completed 🎓",
                "Your session " + updated.getBookingRef() + " is complete.", "SUCCESS");
        return updated;
    }

    public Booking cancelBooking(Long id) {
        Booking booking = findOrThrow(id);
        if (booking.getStatus() == Booking.BookingStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed booking.");
        }
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        Booking updated = bookingRepository.save(booking);

        sendNotification(String.valueOf(updated.getTutorId()), "Booking Cancelled",
                updated.getStudentName() + " cancelled session " + updated.getBookingRef(), "ERROR");
        return updated;
    }

    public Booking updateStatus(Long id, String status) {
        Booking booking = findOrThrow(id);
        booking.setStatus(Booking.BookingStatus.valueOf(status.toUpperCase()));
        return bookingRepository.save(booking);
    }

    /* ═══════════════════════════════════════════════════════════════
       4. QUERY METHODS
    ═══════════════════════════════════════════════════════════════ */

    public List<Booking> getBookingsByStudentUsername(String username) {
        return bookingRepository.findByStudentUsernameOrderByCreatedAtDesc(username);
    }

    public List<Booking> getBookingsByTutorId(Long tutorId) {
        return bookingRepository.findByTutorIdOrderByCreatedAtDesc(tutorId);
    }

    public List<Booking> getPendingBookingsForTutor(Long tutorId) {
        return bookingRepository.findByTutorIdOrderByCreatedAtDesc(tutorId)
                .stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.PENDING)
                .toList();
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<Booking> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }

    /* ═══════════════════════════════════════════════════════════════
       PRIVATE HELPERS & NOTIFICATIONS
    ═══════════════════════════════════════════════════════════════ */

    private Booking findOrThrow(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + id));
    }

    private void sendNotification(String username, String title, String message, String type) {
        try {
            Notification notification = Notification.builder()
                    .username(username)
                    .title(title)
                    .message(message)
                    .type(type)
                    .createdAt(LocalDateTime.now())
                    .isRead(false)
                    .build();

            notificationRepository.save(notification);
            messagingTemplate.convertAndSend("/topic/bookings/" + username, notification);
        } catch (Exception e) {
            System.err.println("[Notification Error]: " + e.getMessage());
        }
    }
}