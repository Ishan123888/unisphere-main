package com.unisphere.booking.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class BookingRequestDTO {

    private Long studentId;
    private String studentName;
    private String studentUsername;

    private Long tutorId;
    private String tutorName;
    private String tutorAvatar;

    private String subject;
    private String slot;
    private String date;
    private String duration;
    private String sessionType;
    private String topic;
    private String notes;
    private String paymentMethod;
    private BigDecimal totalPrice;
    private String meetingLink;
}