package com.unisphere.booking.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "availabilities")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Availability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long tutorId;    // අදාළ Tutor ගේ ID එක
    private String day;      // Monday, Tuesday, etc.
    private String time;     // 09:00 AM, 10:00 AM, etc.

    // මේක true නම් විතරයි student ට පේන්නේ
    @Builder.Default
    private boolean isActive = true;
}