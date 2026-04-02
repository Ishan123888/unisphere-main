package com.unisphere.portfolio.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String badgeName;
    private String description;

    // ✅ GETTERS + SETTERS (REQUIRED)
    public Long getId() { return id; }

    public String getBadgeName() { return badgeName; }
    public void setBadgeName(String badgeName) { this.badgeName = badgeName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}