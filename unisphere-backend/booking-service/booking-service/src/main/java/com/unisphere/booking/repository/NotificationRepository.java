package com.unisphere.booking.repository;

import com.unisphere.booking.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository; // නිවැරදි import එක
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // User අනුව අලුත්ම notifications මුලට එන සේ ලබා ගැනීම
    List<Notification> findByUsernameOrderByCreatedAtDesc(String username);
}