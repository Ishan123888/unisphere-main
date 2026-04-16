package com.unisphere.booking.config;

import com.unisphere.booking.model.Booking;
import com.unisphere.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

//@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final BookingRepository bookingRepository;

    @Override
    public void run(String... args) {
        if (bookingRepository.count() > 0) return; // Already seeded

        bookingRepository.save(Booking.builder()
                .bookingRef("UNI-001")
                .studentId(1L).studentName("Ishan Ekanayaka").studentUsername("it24100001")
                .tutorId(1L).tutorName("Amal Perera").tutorAvatar("AP")
                .subject("Data Structures & Algorithms")
                .slot("Mon 10:00 AM").date("Mar 24, 2026")
                .scheduledSlot(LocalDateTime.of(2026, 3, 24, 10, 0))
                .duration("2 Hours").sessionType("Online")
                .topic("Binary Trees and Graph Algorithms")
                .paymentMethod("card")
                .totalPrice(new BigDecimal("3150"))
                .status(Booking.BookingStatus.CONFIRMED)
                .meetingLink("https://meet.google.com/uni-001")
                .build());

        bookingRepository.save(Booking.builder()
                .bookingRef("UNI-002")
                .studentId(1L).studentName("Ishan Ekanayaka").studentUsername("it24100001")
                .tutorId(2L).tutorName("Dilki Jayawardena").tutorAvatar("DJ")
                .subject("Database Management Systems")
                .slot("Tue 3:00 PM").date("Mar 25, 2026")
                .scheduledSlot(LocalDateTime.of(2026, 3, 25, 15, 0))
                .duration("1 Hour").sessionType("Physical")
                .topic("Normalization and ERD Design")
                .paymentMethod("cash")
                .totalPrice(new BigDecimal("1260"))
                .status(Booking.BookingStatus.PENDING)
                .build());

        bookingRepository.save(Booking.builder()
                .bookingRef("UNI-003")
                .studentId(1L).studentName("Ishan Ekanayaka").studentUsername("it24100001")
                .tutorId(5L).tutorName("Tharaka Silva").tutorAvatar("TS")
                .subject("Web Technologies")
                .slot("Fri 1:00 PM").date("Mar 21, 2026")
                .scheduledSlot(LocalDateTime.of(2026, 3, 21, 13, 0))
                .duration("2 Hours").sessionType("Online")
                .topic("React Hooks and State Management")
                .paymentMethod("card")
                .totalPrice(new BigDecimal("4200"))
                .status(Booking.BookingStatus.COMPLETED)
                .build());

        bookingRepository.save(Booking.builder()
                .bookingRef("UNI-004")
                .studentId(1L).studentName("Ishan Ekanayaka").studentUsername("it24100001")
                .tutorId(4L).tutorName("Nethmi Rodrigo").tutorAvatar("NR")
                .subject("Computer Networks")
                .slot("Wed 11:00 AM").date("Mar 20, 2026")
                .scheduledSlot(LocalDateTime.of(2026, 3, 20, 11, 0))
                .duration("1 Hour").sessionType("Physical")
                .topic("TCP/IP Protocol Stack")
                .paymentMethod("bank")
                .totalPrice(new BigDecimal("1155"))
                .status(Booking.BookingStatus.CANCELLED)
                .build());

        bookingRepository.save(Booking.builder()
                .bookingRef("UNI-005")
                .studentId(2L).studentName("Kasun Perera").studentUsername("it22345678")
                .tutorId(1L).tutorName("Amal Perera").tutorAvatar("AP")
                .subject("Data Structures & Algorithms")
                .slot("Mon 2:00 PM").date("Mar 24, 2026")
                .scheduledSlot(LocalDateTime.of(2026, 3, 24, 14, 0))
                .duration("2 Hours").sessionType("Online")
                .topic("Dynamic Programming")
                .paymentMethod("card")
                .totalPrice(new BigDecimal("3150"))
                .status(Booking.BookingStatus.PENDING)
                .build());

        bookingRepository.save(Booking.builder()
                .bookingRef("UNI-006")
                .studentId(3L).studentName("Sanduni Wickrama").studentUsername("it22456789")
                .tutorId(1L).tutorName("Amal Perera").tutorAvatar("AP")
                .subject("Data Structures & Algorithms")
                .slot("Fri 9:00 AM").date("Mar 28, 2026")
                .scheduledSlot(LocalDateTime.of(2026, 3, 28, 9, 0))
                .duration("1 Hour").sessionType("Online")
                .topic("Sorting Algorithms")
                .paymentMethod("card")
                .totalPrice(new BigDecimal("1575"))
                .status(Booking.BookingStatus.CONFIRMED)
                .build());

        System.out.println("✅ BookingService: Demo data seeded successfully!");
    }
}