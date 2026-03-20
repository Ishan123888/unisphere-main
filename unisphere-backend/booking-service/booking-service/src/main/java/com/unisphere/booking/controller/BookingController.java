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

    // 1. අලුත් බුකින් එකක් නිර්මාණය කිරීම (POST)
    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody Booking booking) {
        Booking savedBooking = bookingService.createBooking(booking);
        return new ResponseEntity<>(savedBooking, HttpStatus.CREATED);
    }

    // 2. බුකින් එකක ස්ටේටස් එක වෙනස් කිරීම (PUT)
    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(bookingService.updateStatus(id, status));
    }

    // 3. සියලුම බුකින් ලබා ගැනීම (GET)
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // --- ADMIN DASHBOARD එකට අවශ්‍ය නව ENDPOINTS ---

    // 4. Admin Stats (Frontend එකේ Card වලට data පෙන්වීමට)
    @GetMapping("/admin/stats")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        Map<String, Object> stats = new HashMap<>();

        // මේවා BookingService එකේ ලියාගන්න ඕනේ (දැනට Dummy logic එකක් පෙන්වන්නේ)
        stats.put("totalBookings", bookingService.getAllBookings().size());
        stats.put("activeTutors", 12); // Service එකෙන් count එක ගන්න
        stats.put("totalStudents", 45); // Service එකෙන් count එක ගන්න

        return ResponseEntity.ok(stats);
    }

    // 5. Pending Tutor/Booking Approvals
    @GetMapping("/admin/pending")
    public ResponseEntity<List<Booking>> getPendingBookings() {
        // Status එක PENDING ඒවා විතරක් පෙරලා එවන්න
        return ResponseEntity.ok(bookingService.getBookingsByStatus("PENDING"));
    }

    // ----------------------------------------------

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }
}