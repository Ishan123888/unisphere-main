package com.unisphere.booking.controller;

import com.unisphere.booking.model.Notification;
import com.unisphere.booking.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository repository;

    /* ── 1. Get notifications for a user ── */
    @GetMapping("/{username}")
    public List<Notification> getNotifications(@PathVariable String username) {
        return repository.findByUsernameOrderByCreatedAtDesc(username);
    }

    /* ── 2. Mark as read ── */
    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        // JpaRepository එක නිවැරදිව extends කර ඇති නිසා findById සහ save දැන් වැඩ කරයි
        Notification n = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));

        n.setRead(true);
        repository.save(n);
    }
        /* ── 3. Manual Notification එකක් Create කිරීම (Testing සඳහා) ── */
        @PostMapping
        public Notification createNotification(@RequestBody Notification notification) {
            notification.setCreatedAt(java.time.LocalDateTime.now());
            notification.setRead(false);
            return repository.save(notification);
        }


}