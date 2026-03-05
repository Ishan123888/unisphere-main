package com.unisphere.booking.service;

import com.unisphere.booking.model.Booking;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    public void sendBookingNotification(Booking booking) {
        // ඇත්තටම Email එකක් යවන Logic එක පස්සේ ලියමු. දැනට log එකක් දාමු.
        System.out.println("--------------------------------------------------");
        System.out.println("📧 SENDING EMAIL NOTIFICATION...");
        System.out.println("To Student ID: " + booking.getStudentId());
        System.out.println("Status Updated to: " + booking.getStatus());
        System.out.println("Meeting Link: " + booking.getMeetingLink());
        System.out.println("--------------------------------------------------");
    }
}