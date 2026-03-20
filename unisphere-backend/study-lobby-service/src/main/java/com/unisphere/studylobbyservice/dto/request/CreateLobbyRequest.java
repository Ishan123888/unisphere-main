package com.unisphere.studylobbyservice.dto.request;

import com.sun.istack.NotNull;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateLobbyRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;

    @NotNull(message = "Max participants is required")
    @Min(value = 2, message = "Minimum 2 participants allowed")
    @Max(value = 10, message = "Maximum 10 participants allowed")
    private Integer maxParticipants;

    @NotBlank(message = "Host user ID is required")
    private String hostUserId;

    @NotBlank(message = "Host username is required")
    private String hostUsername;
}
