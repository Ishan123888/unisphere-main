package com.unisphere.studylobbyservice.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageResponse {
    private Long id;
    private String lobbyCode;
    private String senderId;
    private String senderUsername;
    private String content;
    private LocalDateTime sentAt;
}
