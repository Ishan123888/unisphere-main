package com.unisphere.portfolio.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    private String email;
    private String degreeProgram;
    private String academicYear;

    @Enumerated(EnumType.STRING)
    private UserStatus status;

    // ===== GETTERS & SETTERS =====

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }

    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }

    public void setEmail(String email) { this.email = email; }

    public String getDegreeProgram() { return degreeProgram; }

    public void setDegreeProgram(String degreeProgram) { this.degreeProgram = degreeProgram; }

    public String getAcademicYear() { return academicYear; }

    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public UserStatus getStatus() { return status; }

    public void setStatus(UserStatus status) { this.status = status; }
}