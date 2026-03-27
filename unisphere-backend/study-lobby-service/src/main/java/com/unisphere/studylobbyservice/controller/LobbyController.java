package com.unisphere.studylobbyservice.controller;

import com.unisphere.studylobbyservice.dto.request.CreateLobbyRequest;
import com.unisphere.studylobbyservice.dto.request.JoinLobbyRequest;
import com.unisphere.studylobbyservice.dto.request.SendMessageRequest;
import com.unisphere.studylobbyservice.dto.response.*;
import com.unisphere.studylobbyservice.service.LobbyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lobbies")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LobbyController {

    private final LobbyService lobbyService;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<LobbyResponse>> createLobby(
            @Valid @RequestBody CreateLobbyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Lobby created successfully", lobbyService.createLobby(request)));
    }

    @PostMapping("/join")
    public ResponseEntity<ApiResponse<LobbyResponse>> joinLobby(
            @Valid @RequestBody JoinLobbyRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Joined lobby successfully", lobbyService.joinLobby(request)));
    }

    @GetMapping("/{lobbyCode}")
    public ResponseEntity<ApiResponse<LobbyResponse>> getLobby(@PathVariable String lobbyCode) {
        return ResponseEntity.ok(ApiResponse.success("Lobby fetched", lobbyService.getLobbyByCode(lobbyCode)));
    }

    @GetMapping("/{lobbyCode}/participants")
    public ResponseEntity<ApiResponse<List<ParticipantResponse>>> getParticipants(
            @PathVariable String lobbyCode) {
        return ResponseEntity.ok(ApiResponse.success("Participants fetched", lobbyService.getParticipants(lobbyCode)));
    }

    @PutMapping("/{lobbyCode}/start")
    public ResponseEntity<ApiResponse<LobbyResponse>> startSession(
            @PathVariable String lobbyCode,
            @RequestParam String userId) {
        return ResponseEntity.ok(ApiResponse.success("Session started", lobbyService.startSession(lobbyCode, userId)));
    }

    @PutMapping("/{lobbyCode}/end")
    public ResponseEntity<ApiResponse<LobbyResponse>> endSession(
            @PathVariable String lobbyCode,
            @RequestParam String userId) {
        return ResponseEntity.ok(ApiResponse.success("Session ended", lobbyService.endSession(lobbyCode, userId)));
    }

    @PostMapping("/{lobbyCode}/leave")
    public ResponseEntity<ApiResponse<Void>> leaveLobby(
            @PathVariable String lobbyCode,
            @RequestParam String userId) {
        lobbyService.leaveLobby(lobbyCode, userId);
        return ResponseEntity.ok(ApiResponse.success("Left lobby successfully", null));
    }

    @PostMapping("/{lobbyCode}/messages")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendMessage(
            @PathVariable String lobbyCode,
            @Valid @RequestBody SendMessageRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Message sent", lobbyService.sendMessage(lobbyCode, request)));
    }

    @GetMapping("/{lobbyCode}/messages")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getChatHistory(
            @PathVariable String lobbyCode) {
        return ResponseEntity.ok(ApiResponse.success("Chat history fetched", lobbyService.getChatHistory(lobbyCode)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LobbyResponse>>> getAllLobbies() {
        return ResponseEntity.ok(ApiResponse.success("Lobbies fetched", lobbyService.getAllLobbies()));
    }

    @DeleteMapping("/{lobbyCode}")
    public ResponseEntity<ApiResponse<Void>> deleteLobby(
            @PathVariable String lobbyCode,
            @RequestParam String userId) {
        lobbyService.deleteLobby(lobbyCode, userId);
        return ResponseEntity.ok(ApiResponse.success("Lobby deleted successfully", null));
    }
}
