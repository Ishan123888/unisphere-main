package com.unisphere.portfolio.dto;

public class AdminProfileUpdateRequest {
    private String fullName;
    private String email;
    private String phoneNumber;
    private String profilePictureUrl;
    private String department;
    private String designation;
    private String bio;

    // ===== GETTERS & SETTERS =====

    public String getFullName() { return fullName; }

    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }

    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }

    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getProfilePictureUrl() { return profilePictureUrl; }

    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }

    public String getDepartment() { return department; }

    public void setDepartment(String department) { this.department = department; }

    public String getDesignation() { return designation; }

    public void setDesignation(String designation) { this.designation = designation; }

    public String getBio() { return bio; }

    public void setBio(String bio) { this.bio = bio; }
}
