package com.unisphere.booking.controller;

import com.unisphere.booking.model.Booking;
import com.unisphere.booking.model.Availability;
import com.unisphere.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    /* ── 1. Create new booking ──────────────────────────────────── */
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Booking booking) {
        try {
            Booking saved = bookingService.createBooking(booking);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (RuntimeException e) {
            Map<String, String> err = new HashMap<>();
            err.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }
    }

    /* ── 2. Student bookings ────────────────────────────────────── */
    @GetMapping("/student/{username}")
    public ResponseEntity<List<Booking>> getStudentBookings(@PathVariable String username) {
        return ResponseEntity.ok(bookingService.getBookingsByStudentUsername(username));
    }

    /* ── 3. Tutor bookings (all) ────────────────────────────────── */
    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<List<Booking>> getTutorBookings(@PathVariable Long tutorId) {
        return ResponseEntity.ok(bookingService.getBookingsByTutorId(tutorId));
    }

    /* ── 4. Tutor pending requests only (Dashboard) ─────────────── */
    @GetMapping("/tutor/{tutorId}/pending")
    public ResponseEntity<List<Booking>> getTutorPendingBookings(@PathVariable Long tutorId) {
        return ResponseEntity.ok(bookingService.getPendingBookingsForTutor(tutorId));
    }

    /* ── 5. All bookings (Admin) ────────────────────────────────── */
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    /* ── 6. Get by ID ───────────────────────────────────────────── */
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        return bookingService.getBookingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /* ── 7. TUTOR APPROVES — PENDING → CONFIRMED ────────────────── */
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveBooking(@PathVariable Long id) {
        try {
            Booking updated = bookingService.approveBooking(id);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            Map<String, String> err = new HashMap<>();
            err.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }
    }

    /* ── 8. TUTOR REJECTS — PENDING → CANCELLED ─────────────────── */
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectBooking(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        try {
            Booking updated = bookingService.rejectBooking(id, reason);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            Map<String, String> err = new HashMap<>();
            err.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }
    }

    /* ── 9. COMPLETE SESSION — CONFIRMED → COMPLETED ────────────── */
    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeBooking(@PathVariable Long id) {
        try {
            Booking updated = bookingService.completeBooking(id);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            Map<String, String> err = new HashMap<>();
            err.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }
    }

    /* ── 10. Generic status update (Admin) ──────────────────────── */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            Booking updated = bookingService.updateStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            Map<String, String> err = new HashMap<>();
            err.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }
    }

    /* ── 11. Student self-cancel ─────────────────────────────────── */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        try {
            Booking cancelled = bookingService.cancelBooking(id);
            return ResponseEntity.ok(cancelled);
        } catch (RuntimeException e) {
            Map<String, String> err = new HashMap<>();
            err.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }
    }

    /* ── 12. Admin stats ─────────────────────────────────────────── */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        List<Booking> all = bookingService.getAllBookings();
        Map<String, Object> stats = new HashMap<>();
        stats.put("total",     all.size());
        stats.put("pending",   all.stream().filter(b -> b.getStatus() == Booking.BookingStatus.PENDING).count());
        stats.put("confirmed", all.stream().filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED).count());
        stats.put("completed", all.stream().filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED).count());
        stats.put("cancelled", all.stream().filter(b -> b.getStatus() == Booking.BookingStatus.CANCELLED).count());
        stats.put("revenue",   all.stream()
                .filter(b -> b.getStatus() != Booking.BookingStatus.CANCELLED && b.getTotalPrice() != null)
                .mapToDouble(b -> b.getTotalPrice().doubleValue()).sum());
        return ResponseEntity.ok(stats);
    }

    /* ═══════════════════════════════════════════════════════════════
       NEW: TUTOR AVAILABILITY ENDPOINTS
    ═══════════════════════════════════════════════════════════════ */

    // 13. Save availability slots for a tutor
    @PostMapping("/tutor/{tutorId}/availability")
    public ResponseEntity<?> saveAvailability(
            @PathVariable Long tutorId,
            @RequestBody List<Availability> availabilityList) {
        try {
            bookingService.saveTutorAvailability(tutorId, availabilityList);

            // FIX: String එකක් වෙනුවට JSON Object (Map) එකක් return කරනවා
            Map<String, String> response = new HashMap<>();
            response.put("message", "Availability saved successfully.");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // 14. Get availability slots for a tutor
    @GetMapping("/tutor/{tutorId}/availability")
    public ResponseEntity<List<Availability>> getTutorAvailability(@PathVariable Long tutorId) {
        return ResponseEntity.ok(bookingService.getTutorAvailability(tutorId));
    }
}