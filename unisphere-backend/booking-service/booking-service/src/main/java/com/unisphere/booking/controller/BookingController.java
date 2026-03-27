package com.unisphere.booking.controller;

import com.unisphere.booking.model.Booking;
import com.unisphere.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    /* ── 1. Create new booking ──────────────────────────────────── */
    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody Booking booking) {
        Booking saved = bookingService.createBooking(booking);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /* ── 2. Get all bookings for a student ──────────────────────── */
    @GetMapping("/student/{username}")
    public ResponseEntity<List<Booking>> getStudentBookings(@PathVariable String username) {
        List<Booking> bookings = bookingService.getBookingsByStudentUsername(username);
        return ResponseEntity.ok(bookings);
    }

    /* ── 3. Get all bookings for a tutor ────────────────────────── */
    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<List<Booking>> getTutorBookings(@PathVariable Long tutorId) {
        List<Booking> bookings = bookingService.getBookingsByTutorId(tutorId);
        return ResponseEntity.ok(bookings);
    }

    /* ── 4. Get all bookings (Admin) ────────────────────────────── */
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    /* ── 5. Get booking by ID ───────────────────────────────────── */
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        return bookingService.getBookingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /* ── 6. Update booking status ───────────────────────────────── */
    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        Booking updated = bookingService.updateStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    /* ── 7. Cancel booking ──────────────────────────────────────── */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(@PathVariable Long id) {
        Booking cancelled = bookingService.cancelBooking(id);
        return ResponseEntity.ok(cancelled);
    }

    /* ── 8. Admin stats ─────────────────────────────────────────── */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        List<Booking> all = bookingService.getAllBookings();
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
}