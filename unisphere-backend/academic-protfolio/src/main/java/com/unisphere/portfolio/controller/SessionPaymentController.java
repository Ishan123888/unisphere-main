package com.unisphere.portfolio.controller;

import com.unisphere.portfolio.dto.SessionPaymentRequest;
import com.unisphere.portfolio.dto.SessionPaymentResponse;
import com.unisphere.portfolio.entity.SessionPayment;
import com.unisphere.portfolio.service.SessionPaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class SessionPaymentController {

    private final SessionPaymentService paymentService;

    public SessionPaymentController(SessionPaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/initiate")
    public ResponseEntity<Map<String, String>> initiatePayment(@RequestBody SessionPaymentRequest request) {
        return ResponseEntity.ok(paymentService.initiatePayment(request));
    }

    @PostMapping("/complete")
    public ResponseEntity<SessionPayment> completePayment(
            @RequestParam String orderId,
            @RequestParam String transactionId
    ) {
        return ResponseEntity.ok(paymentService.completePayment(orderId, transactionId));
    }

    @GetMapping("/check/{studentId}/{sessionId}")
    public ResponseEntity<Boolean> isSessionPaid(
            @PathVariable Long studentId,
            @PathVariable Long sessionId
    ) {
        return ResponseEntity.ok(paymentService.isSessionPaid(studentId, sessionId));
    }

    @GetMapping("/status/{studentId}/{sessionId}")
    public ResponseEntity<SessionPaymentResponse> getPaymentStatus(
            @PathVariable Long studentId,
            @PathVariable Long sessionId
    ) {
        return ResponseEntity.ok(paymentService.getPaymentStatus(studentId, sessionId));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<SessionPayment>> getStudentPayments(@PathVariable Long studentId) {
        return ResponseEntity.ok(paymentService.getStudentPayments(studentId));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<SessionPayment>> getSessionPayments(@PathVariable Long sessionId) {
        return ResponseEntity.ok(paymentService.getSessionPayments(sessionId));
    }

    @GetMapping("/student/{studentId}/paid-sessions")
    public ResponseEntity<List<Long>> getPaidSessionIds(@PathVariable Long studentId) {
        return ResponseEntity.ok(paymentService.getPaidSessionIds(studentId));
    }
}
