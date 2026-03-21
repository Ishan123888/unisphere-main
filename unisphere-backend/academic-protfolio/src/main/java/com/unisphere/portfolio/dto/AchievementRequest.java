package com.unisphere.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AchievementRequest {

    @NotNull(message = "Student Id is required")
    private Long studentId;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Institution is required")
    private String institution;

    @NotBlank(message = "Level is required")
    private String level;

    @NotBlank(message = "Achievement Date is required")
    private String achievementDate;
}