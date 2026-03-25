package com.unisphere.booking.service;

import com.unisphere.booking.model.Booking;
import com.unisphere.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AIMatchingEngine {

    private final BookingRepository bookingRepository;

    /**
     * Returns a ranked list of tutorIds for a given subject.
     * Ranking is based on:
     *   1. Number of COMPLETED sessions for that subject (experience)
     *   2. Fewer CANCELLED sessions (reliability score)
     */
    public List<Long> rankTutorsForSubject(String subject) {
        List<Booking> all = bookingRepository.findAllByOrderByCreatedAtDesc();

        // Filter by subject
        List<Booking> subjectBookings = all.stream()
                .filter(b -> subject.equalsIgnoreCase(b.getSubject()))
                .collect(Collectors.toList());

        // Score each tutor
        Map<Long, Double> scoreMap = new HashMap<>();

        for (Booking b : subjectBookings) {
            Long tutorId = b.getTutorId();
            double score = scoreMap.getOrDefault(tutorId, 0.0);

            if (b.getStatus() == Booking.BookingStatus.COMPLETED)  score += 2.0;
            if (b.getStatus() == Booking.BookingStatus.CONFIRMED)   score += 1.0;
            if (b.getStatus() == Booking.BookingStatus.CANCELLED)   score -= 1.0;

            scoreMap.put(tutorId, score);
        }

        // Sort by score descending
        return scoreMap.entrySet().stream()
                .sorted(Map.Entry.<Long, Double>comparingByValue().reversed())
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    /**
     * Returns top N suggested tutors for a student based on
     * their past booking subjects.
     */
    public List<Long> suggestTutorsForStudent(String studentUsername, int topN) {
        List<Booking> studentBookings = bookingRepository
                .findByStudentUsernameOrderByCreatedAtDesc(studentUsername);

        if (studentBookings.isEmpty()) return Collections.emptyList();

        // Find most-booked subject
        String preferredSubject = studentBookings.stream()
                .collect(Collectors.groupingBy(Booking::getSubject, Collectors.counting()))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);

        if (preferredSubject == null) return Collections.emptyList();

        List<Long> ranked = rankTutorsForSubject(preferredSubject);
        return ranked.stream().limit(topN).collect(Collectors.toList());
    }
}