package com.unisphere.studylobbyservice.controller;

import com.unisphere.studylobbyservice.dto.request.SendMessageRequest;
import com.unisphere.studylobbyservice.service.LobbyService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final LobbyService lobbyService;

    // WebSocket endpoint: client sends to /app/chat/{lobbyCode}
    // Broadcast happens inside LobbyService to /topic/lobby/{lobbyCode}/chat
    @MessageMapping("/chat/{lobbyCode}")
    public void handleChatMessage(@DestinationVariable String lobbyCode,
                                  SendMessageRequest request) {
        lobbyService.sendMessage(lobbyCode, request);
    }
}
