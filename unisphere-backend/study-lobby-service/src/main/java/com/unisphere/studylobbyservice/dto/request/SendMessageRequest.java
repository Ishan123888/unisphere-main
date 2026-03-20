package com.unisphere.studylobbyservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {

    @NotBlank(message = "Sender ID is required")
    private String senderId;

    @NotBlank(message = "Sender username is required")
    private String senderUsername;

    @NotBlank(message = "Message content is required")
    private String content;
}
