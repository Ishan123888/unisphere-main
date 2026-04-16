package com.unisphere.booking.controller;

import com.unisphere.booking.model.Booking;
import com.unisphere.booking.repository.BookingRepository;
import com.unisphere.booking.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;

@RestController
@RequestMapping("/api/v1/reports")
@CrossOrigin(origins = "*") // Frontend එකට access දීමට
public class ReportController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping(value = "/invoice/{id}", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<InputStreamResource> getInvoice(@PathVariable Long id) {

        // Database එකෙන් Booking එක සොයා ගැනීම
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        ByteArrayInputStream bis = reportService.generateBookingInvoice(booking);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "inline; filename=invoice.pdf");

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }
}