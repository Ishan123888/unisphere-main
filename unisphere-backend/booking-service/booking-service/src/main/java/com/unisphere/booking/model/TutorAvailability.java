package com.unisphere.booking.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tutor_availability")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TutorAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long tutorId;

    @Column(nullable = false)
    private String dayOfWeek;   // e.g. "Monday"

    @Column(nullable = false)
    private String timeSlot;    // e.g. "10:00 AM"

    @Column(nullable = false)
    private String duration;    // e.g. "1 Hour", "2 Hours"

    private boolean booked;     // true = slot taken
}