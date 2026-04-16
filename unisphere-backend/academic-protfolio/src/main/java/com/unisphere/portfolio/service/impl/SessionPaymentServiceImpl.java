package com.unisphere.portfolio.service.impl;

import com.unisphere.portfolio.dto.SessionPaymentRequest;
import com.unisphere.portfolio.dto.SessionPaymentResponse;
import com.unisphere.portfolio.entity.Session;
import com.unisphere.portfolio.entity.SessionPayment;
import com.unisphere.portfolio.entity.Student;
import com.unisphere.portfolio.repository.SessionPaymentRepository;
import com.unisphere.portfolio.repository.SessionRepository;
import com.unisphere.portfolio.repository.StudentRepository;
import com.unisphere.portfolio.service.SessionPaymentService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@Service
public class SessionPaymentServiceImpl implements SessionPaymentService {

    private final SessionPaymentRepository paymentRepository;
    private final StudentRepository studentRepository;
    private final SessionRepository sessionRepository;

    @Value("${directpay.merchant.id}")
    private String merchantId;

    @Value("${directpay.secret.key}")
    private String secretKey;

    public SessionPaymentServiceImpl(
            SessionPaymentRepository paymentRepository,
            StudentRepository studentRepository,
            SessionRepository sessionRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.studentRepository = studentRepository;
        this.sessionRepository = sessionRepository;
    }

    @Override
    public Map<String, String> initiatePayment(SessionPaymentRequest request) {
        try {
            if (request.getStudentId() == null || request.getSessionId() == null) {
                throw new RuntimeException("Student ID and Session ID are required");
            }

            Student student = studentRepository.findById(request.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Student not found with ID: " + request.getStudentId()));

            Session session = sessionRepository.findById(request.getSessionId())
                    .orElseThrow(() -> new RuntimeException("Session not found with ID: " + request.getSessionId()));

            // Check if already paid
            if (isSessionPaid(request.getStudentId(), request.getSessionId())) {
                throw new RuntimeException("Session already paid");
            }

            String orderId = "ORDER" + System.currentTimeMillis();

            // Create payment record
            SessionPayment payment = new SessionPayment();
            payment.setStudent(student);
            payment.setSession(session);
            payment.setAmount(session.getPrice());
            payment.setPaymentStatus("PENDING");
            payment.setOrderId(orderId);
            paymentRepository.save(payment);

            // Extract student name parts safely
            String firstName = "Student";
            String lastName = "";
            
            if (student.getFullName() != null && !student.getFullName().isEmpty()) {
                String[] nameParts = student.getFullName().trim().split("\\s+");
                firstName = nameParts[0];
                if (nameParts.length > 1) {
                    lastName = nameParts[1];
                }
            }

            // Create DirectPay payload with student details from database
            Map<String, Object> payload = new HashMap<>();
            payload.put("merchant_id", merchantId);
            payload.put("amount", session.getPrice().doubleValue());
            payload.put("type", "ONE_TIME");
            payload.put("order_id", orderId);
            payload.put("currency", "LKR");
            payload.put("response_url", "http://localhost:3000/payment-success");
            payload.put("first_name", firstName);
            payload.put("last_name", lastName);
            payload.put("email", student.getEmail() != null ? student.getEmail() : "student@example.com");
            payload.put("phone", "0771234567");
            payload.put("logo", "");

            String jsonPayload = convertToJson(payload);
            String encodedPayload = Base64.getEncoder().encodeToString(jsonPayload.getBytes());
            String signature = generateSignature(encodedPayload);

            Map<String, String> response = new HashMap<>();
            response.put("encodedPayload", encodedPayload);
            response.put("signature", signature);
            response.put("orderId", orderId);

            return response;
        } catch (Exception e) {
            System.err.println("Payment initiation error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Payment initiation failed: " + e.getMessage(), e);
        }
    }

    @Override
    public SessionPayment completePayment(String orderId, String transactionId) {
        SessionPayment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setPaymentStatus("COMPLETED");
        payment.setTransactionId(transactionId);
        payment.setPaidAt(LocalDateTime.now());

        return paymentRepository.save(payment);
    }

    @Override
    public boolean isSessionPaid(Long studentId, Long sessionId) {
        return paymentRepository.findByStudentIdAndSessionIdAndPaymentStatus(
                studentId, sessionId, "COMPLETED"
        ).isPresent();
    }

    @Override
    public SessionPaymentResponse getPaymentStatus(Long studentId, Long sessionId) {
        SessionPayment payment = paymentRepository.findByStudentIdAndSessionIdAndPaymentStatus(
                studentId, sessionId, "COMPLETED"
        ).orElse(null);

        if (payment == null) {
            return null;
        }

        return new SessionPaymentResponse(
                payment.getId(),
                payment.getStudent().getId(),
                payment.getSession().getId(),
                payment.getAmount(),
                payment.getPaymentStatus(),
                payment.getOrderId(),
                payment.getTransactionId(),
                payment.getCreatedAt().toString()
        );
    }

    @Override
    public List<SessionPayment> getStudentPayments(Long studentId) {
        return paymentRepository.findByStudentId(studentId);
    }

    @Override
    public List<SessionPayment> getSessionPayments(Long sessionId) {
        return paymentRepository.findBySessionId(sessionId);
    }

    @Override
    public List<Long> getPaidSessionIds(Long studentId) {
        List<SessionPayment> payments = paymentRepository.findByStudentIdAndPaymentStatus(studentId, "COMPLETED");
        return payments.stream()
                .map(payment -> payment.getSession().getId())
                .toList();
    }

    private String generateSignature(String encodedPayload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(encodedPayload.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error generating signature", e);
        }
    }

    private String convertToJson(Map<String, Object> map) {
        StringBuilder json = new StringBuilder("{");
        map.forEach((key, value) -> {
            if (json.length() > 1) json.append(",");
            json.append("\"").append(key).append("\":");
            if (value instanceof String) {
                json.append("\"").append(value).append("\"");
            } else {
                json.append(value);
            }
        });
        json.append("}");
        return json.toString();
    }
}
