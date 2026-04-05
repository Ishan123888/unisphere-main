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

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id; // 👈 මේ int එකට තමයි අපි AuthResponse එක හැදුවේ

    private String username;
    private String email;
    private String password;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private String status = "ACTIVE";

    private String firstName;
    private String lastName;
    private String phone;
    private String university;
    private String qualification;
    private String yearOfStudy;
    private String experience;
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String subjects;

    @Column(columnDefinition = "TEXT")
    private String tags;

    private String bio;
    private Double hourlyRate;
    private String sessionType;
    private String avatar;

    private Integer sessions  = 0;
    private Double  rating    = 0.0;
    private Integer reviews   = 0;
    private Boolean available = true;

    private String level;

    @Column(columnDefinition = "TEXT")
    private String preferredSubjects;

    @Transient
    private List<String> subjectsRaw;

    @Transient
    private List<String> tagsRaw;

    @Transient
    private List<String> preferredSubjectsRaw;
}