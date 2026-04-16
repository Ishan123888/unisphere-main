package com.unisphere.booking.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username; // කාටද මේක පෙන්වන්න ඕනේ (it24100001)
    private String title;
    private String message;
    private String type; // SUCCESS, INFO, WARNING, ERROR
    private LocalDateTime createdAt;
    private boolean isRead = false;
}