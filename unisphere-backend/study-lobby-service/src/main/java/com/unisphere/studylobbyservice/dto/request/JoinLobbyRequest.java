package com.unisphere.studylobbyservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JoinLobbyRequest {

    @NotBlank(message = "Lobby code is required")
    private String lobbyCode;

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Username is required")
    private String username;
}
