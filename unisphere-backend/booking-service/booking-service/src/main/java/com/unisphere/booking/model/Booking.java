package com.unisphere.booking.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String bookingRef;       // e.g. UNI-001

    @Column(nullable = false)
    private Long studentId;

    @Column(nullable = false)
    private String studentName;

    @Column(nullable = false)
    private String studentUsername;  // it24100001

    @Column(nullable = false)
    private Long tutorId;

    @Column(nullable = false)
    private String tutorName;

    @Column(nullable = false)
    private String tutorAvatar;      // AP, TS etc.

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private String slot;             // Mon 10:00 AM

    @Column(nullable = false)
    private String date;             // Mar 24, 2026

    @Column(nullable = false)
    private String duration;         // 2 Hours

    @Column(nullable = false)
    private String sessionType;      // Online / Physical

    private String topic;
    private String notes;
    private String paymentMethod;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    private BigDecimal totalPrice;
    private String meetingLink;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    public enum BookingStatus {
        PENDING, CONFIRMED, CANCELLED, COMPLETED
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = BookingStatus.PENDING;
        }
    }
}