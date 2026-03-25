package com.unisphere.booking.service;
import com.unisphere.booking.model.Booking;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    public void notifyBookingCreated(Booking booking) {
        System.out.println("Booking created: " + booking.getBookingRef());
    }
    public void notifyStatusChange(Booking booking) {
        System.out.println("Status changed: " + booking.getBookingRef() + " -> " + booking.getStatus());
    }
}