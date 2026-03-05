package com.unisphere.booking.controller;

import com.unisphere.booking.model.Booking;
import com.unisphere.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // ඕනෑම තැනක සිට Frontend එකට කනෙක්ට් වීමට ඉඩ දීම
public class BookingController {

    private final BookingService bookingService;

    // 1. අලුත් බුකින් එකක් නිර්මාණය කිරීම (POST)
    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody Booking booking) {
        Booking savedBooking = bookingService.createBooking(booking);
        // අලුතින් දත්තයක් හැදූ නිසා HttpStatus.CREATED (201) යැවීම වඩාත් උචිතයි
        return new ResponseEntity<>(savedBooking, HttpStatus.CREATED);
    }

    // 2. බුකින් එකක ස්ටේටස් එක වෙනස් කිරීම (PUT)
    // උදා: /api/bookings/1/status?status=CONFIRMED
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

    // 4. ID එක අනුව නිශ්චිත බුකින් එකක් සෙවීම (GET)
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }
}