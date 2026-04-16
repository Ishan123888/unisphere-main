package com.unisphere.portfolio.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String username; // SLIIT ID e.g. it24100001

    private String password; // plain text — portfolio module only

    private String fullName;
    private String email;
    private String degreeProgram;
    private String academicYear;

    @Enumerated(EnumType.STRING)
    private UserStatus status;

    // Session/Auth field - for now hardcoded to identify current student
    @Transient
    private boolean isCurrentUser = false;

    // ===== GETTERS & SETTERS =====

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }

    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }

    public void setPassword(String password) { this.password = password; }

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

    public boolean isCurrentUser() { return isCurrentUser; }

    public void setCurrentUser(boolean currentUser) { isCurrentUser = currentUser; }
}