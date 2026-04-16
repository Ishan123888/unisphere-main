package com.unisphere.portfolio.service;

import com.unisphere.portfolio.dto.SessionPaymentRequest;
import com.unisphere.portfolio.dto.SessionPaymentResponse;
import com.unisphere.portfolio.entity.SessionPayment;

import java.util.List;
import java.util.Map;

public interface SessionPaymentService {
    Map<String, String> initiatePayment(SessionPaymentRequest request);
    SessionPayment completePayment(String orderId, String transactionId);
    boolean isSessionPaid(Long studentId, Long sessionId);
    SessionPaymentResponse getPaymentStatus(Long studentId, Long sessionId);
    List<SessionPayment> getStudentPayments(Long studentId);
    List<SessionPayment> getSessionPayments(Long sessionId);
    List<Long> getPaidSessionIds(Long studentId);
}
