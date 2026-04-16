package com.unisphere.portfolio.repository;

import com.unisphere.portfolio.entity.SessionPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionPaymentRepository extends JpaRepository<SessionPayment, Long> {
    Optional<SessionPayment> findByStudentIdAndSessionIdAndPaymentStatus(Long studentId, Long sessionId, String paymentStatus);
    List<SessionPayment> findByStudentId(Long studentId);
    List<SessionPayment> findBySessionId(Long sessionId);
    Optional<SessionPayment> findByOrderId(String orderId);
    List<SessionPayment> findByStudentIdAndPaymentStatus(Long studentId, String paymentStatus);
}
