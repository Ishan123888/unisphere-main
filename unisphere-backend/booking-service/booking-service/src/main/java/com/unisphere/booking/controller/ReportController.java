package com.unisphere.booking.controller;

import com.unisphere.booking.dto.APIResponse;
import com.unisphere.booking.model.Booking;
import com.unisphere.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReportController {

    private final BookingService bookingService;

    /* ── 1. Download booking invoice as text/plain (PDF-ready) ───── */
    @GetMapping("/invoice/{bookingId}")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long bookingId) {
        Booking booking = bookingService.getBookingById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        String invoiceText = buildInvoiceText(booking);
        byte[] bytes = invoiceText.getBytes();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=invoice-" + booking.getBookingRef() + ".txt")
                .contentType(MediaType.TEXT_PLAIN)
                .body(bytes);
    }

    /* ── 2. Tutor session summary report ─────────────────────────── */
    @GetMapping("/tutor/{tutorId}/summary")
    public ResponseEntity<APIResponse<String>> tutorSummary(@PathVariable Long tutorId) {
        List<Booking> bookings = bookingService.getBookingsByTutorId(tutorId);

        long completed = bookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED).count();
        double earnings = bookings.stream()
                .filter(b -> b.getStatus() != Booking.BookingStatus.CANCELLED
                        && b.getTotalPrice() != null)
                .mapToDouble(b -> b.getTotalPrice().doubleValue()).sum();

        String summary = String.format(
                "Tutor ID: %d | Total Sessions: %d | Completed: %d | Total Earnings: LKR %.2f",
                tutorId, bookings.size(), completed, earnings);

        return ResponseEntity.ok(APIResponse.ok("Summary generated", summary));
    }

    /* ── Helper ───────────────────────────────────────────────────── */
    private String buildInvoiceText(Booking b) {
        return "========================================\n" +
                "          UNISPHERE INVOICE             \n" +
                "========================================\n" +
                "Booking Ref  : " + b.getBookingRef() + "\n" +
                "Date Issued  : " + LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")) + "\n" +
                "----------------------------------------\n" +
                "Student      : " + b.getStudentName() + " (" + b.getStudentUsername() + ")\n" +
                "Tutor        : " + b.getTutorName() + "\n" +
                "Subject      : " + b.getSubject() + "\n" +
                "Session Date : " + b.getDate() + "\n" +
                "Slot         : " + b.getSlot() + "\n" +
                "Duration     : " + b.getDuration() + "\n" +
                "Session Type : " + b.getSessionType() + "\n" +
                "Status       : " + b.getStatus() + "\n" +
                "----------------------------------------\n" +
                "Total Amount : LKR " + (b.getTotalPrice() != null
                ? b.getTotalPrice().toPlainString() : "0.00") + "\n" +
                "Payment      : " + b.getPaymentMethod() + "\n" +
                "========================================\n" +
                "        Thank you for using UniSphere!  \n" +
                "========================================\n";
    }
}