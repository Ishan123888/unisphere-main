package com.unisphere.portfolio.dto;

public class SessionPaymentRequest {
    private Long studentId;
    private Long sessionId;

    public SessionPaymentRequest() {}

    public SessionPaymentRequest(Long studentId, Long sessionId) {
        this.studentId = studentId;
        this.sessionId = sessionId;
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
}
