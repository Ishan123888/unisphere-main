package com.unisphere.booking.controller;

import com.unisphere.booking.dto.APIResponse;
import com.unisphere.booking.model.Booking;
import com.unisphere.booking.service.AIMatchingEngine;
import com.unisphere.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tutors")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TutorProfileController {

    private final BookingService bookingService;
    private final AIMatchingEngine aiMatchingEngine;

    /* ── 1. Get tutor stats (earnings, sessions) ─────────────────── */
    @GetMapping("/{tutorId}/stats")
    public ResponseEntity<APIResponse<Map<String, Object>>> getTutorStats(
            @PathVariable Long tutorId) {

        List<Booking> bookings = bookingService.getBookingsByTutorId(tutorId);

        long completed = bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED).count();
        long confirmed = bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED).count();
        long cancelled = bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.CANCELLED).count();

        double totalEarnings = bookings.stream()
                .filter(b -> b.getStatus() != Booking.BookingStatus.CANCELLED
                        && b.getTotalPrice() != null)
                .mapToDouble(b -> b.getTotalPrice().doubleValue())
                .sum();

        // Subject breakdown
        Map<String, Long> subjectBreakdown = bookings.stream()
                .collect(Collectors.groupingBy(Booking::getSubject, Collectors.counting()));

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSessions", bookings.size());
        stats.put("completed",     completed);
        stats.put("confirmed",     confirmed);
        stats.put("cancelled",     cancelled);
        stats.put("totalEarnings", totalEarnings);
        stats.put("subjectBreakdown", subjectBreakdown);

        return ResponseEntity.ok(APIResponse.ok("Tutor stats fetched", stats));
    }

    /* ── 2. AI: Get ranked tutors for a subject ──────────────────── */
    @GetMapping("/match")
    public ResponseEntity<APIResponse<List<Long>>> matchTutors(
            @RequestParam String subject) {
        List<Long> ranked = aiMatchingEngine.rankTutorsForSubject(subject);
        return ResponseEntity.ok(APIResponse.ok("Tutor match result", ranked));
    }

    /* ── 3. AI: Suggest tutors for a student ─────────────────────── */
    @GetMapping("/suggest")
    public ResponseEntity<APIResponse<List<Long>>> suggestTutors(
            @RequestParam String studentUsername,
            @RequestParam(defaultValue = "5") int top) {
        List<Long> suggestions = aiMatchingEngine.suggestTutorsForStudent(studentUsername, top);
        return ResponseEntity.ok(APIResponse.ok("Suggestions fetched", suggestions));
    }
}