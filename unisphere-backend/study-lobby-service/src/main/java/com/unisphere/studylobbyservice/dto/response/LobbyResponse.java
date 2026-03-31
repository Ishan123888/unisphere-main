package com.unisphere.studylobbyservice.dto.response;

import com.unisphere.studylobbyservice.enums.LobbyStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LobbyResponse {
    private Long id;
    private String lobbyCode;
    private String hostUserId;
    private String hostUsername;
    private String title;
    private int maxParticipants;
    private int currentCount;
    private LobbyStatus status;
    private boolean isFull;
    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
}
