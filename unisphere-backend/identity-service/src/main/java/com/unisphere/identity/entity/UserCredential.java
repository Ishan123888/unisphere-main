package com.unisphere.identity.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "user_credential")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserCredential {

    // ── Primary key ──────────────────────────────────────────────
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    // ── Auth fields ──────────────────────────────────────────────
    private String username;            // email used as username
    private String email;
    private String password;            // BCrypt encoded in AuthService

    @Column(nullable = false)
    private String role;                // "TUTOR" | "STUDENT" | "ADMIN"

    @Column(nullable = false)
    private String status = "ACTIVE";   // TUTOR → "PENDING_REVIEW" | STUDENT → "ACTIVE"

    // ── Common profile ───────────────────────────────────────────
    private String firstName;
    private String lastName;
    private String phone;
    private String university;

    // ── Tutor-specific ───────────────────────────────────────────
    private String qualification;       // "BSc Computer Science (Hons)"
    private String yearOfStudy;         // "4TH_YEAR" → card badge "4th Year"
    private String experience;          // "3_TO_5" → AI match score weight

    private String subject;             // Primary subject on card (auto-set to subjects[0])

    @Column(columnDefinition = "TEXT")
    private String subjects;            // Stored as "React,DSA,OOP" — split on read

    @Column(columnDefinition = "TEXT")
    private String tags;                // Skill pills on card — "React,Node.js,MySQL"

    private String bio;                 // Card bio text
    private Double hourlyRate;          // "Per Hour Rs. X" on card
    private String sessionType;         // "ONLINE" | "PHYSICAL" | "BOTH"
    private String avatar;              // Emoji or Cloudinary URL

    // Updated by booking-service over time
    private Integer sessions  = 0;      // "487 sessions" on card
    private Double  rating    = 0.0;    // Star rating
    private Integer reviews   = 0;      // "(210 reviews)"
    private Boolean available = true;   // Green/red dot

    // ── Student-specific ─────────────────────────────────────────
    private String level;               // "UG_Y4" | "AL"

    @Column(columnDefinition = "TEXT")
    private String preferredSubjects;   // "Mathematics,Physics" — find matching tutors

    // ── Transient fields (JSON in, not persisted) ─────────────────
    // Frontend sends subjects/tags/preferredSubjects as String arrays.
    // AuthService reads these, joins to comma-string, sets the @Column fields above.

    @Transient
    private List<String> subjectsRaw;           // ["Web Technologies","Computer Science"]

    @Transient
    private List<String> tagsRaw;               // ["React","Node.js","Spring Boot"]

    @Transient
    private List<String> preferredSubjectsRaw;  // ["Mathematics","Physics"]
}