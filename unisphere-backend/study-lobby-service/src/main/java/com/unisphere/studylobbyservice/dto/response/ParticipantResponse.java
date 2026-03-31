package com.unisphere.studylobbyservice.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParticipantResponse {
    private Long id;
    private String userId;
    private String username;
    private LocalDateTime joinedAt;
    private boolean active;
}
