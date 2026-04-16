package com.unisphere.portfolio.dto;

import java.math.BigDecimal;

public class SessionPaymentResponse {
    private Long paymentId;
    private Long studentId;
    private Long sessionId;
    private BigDecimal amount;
    private String paymentStatus;
    private String orderId;
    private String transactionId;
    private String createdAt;

    public SessionPaymentResponse() {}

    public SessionPaymentResponse(Long paymentId, Long studentId, Long sessionId, BigDecimal amount, String paymentStatus, String orderId, String transactionId, String createdAt) {
        this.paymentId = paymentId;
        this.studentId = studentId;
        this.sessionId = sessionId;
        this.amount = amount;
        this.paymentStatus = paymentStatus;
        this.orderId = orderId;
        this.transactionId = transactionId;
        this.createdAt = createdAt;
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Long getSessionId() {
        return sessionId;
    }

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}
