package com.unisphere.studylobbyservice.service;

import com.unisphere.studylobbyservice.dto.request.CreateLobbyRequest;
import com.unisphere.studylobbyservice.dto.request.JoinLobbyRequest;
import com.unisphere.studylobbyservice.dto.request.SendMessageRequest;
import com.unisphere.studylobbyservice.dto.response.*;
import com.unisphere.studylobbyservice.entity.*;
import com.unisphere.studylobbyservice.enums.LobbyStatus;
import com.unisphere.studylobbyservice.exception.LobbyException;
import com.unisphere.studylobbyservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LobbyService {

    private final LobbyRepository lobbyRepository;
    private final LobbyParticipantRepository participantRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // CREATE LOBBY
    @Transactional
    public LobbyResponse createLobby(CreateLobbyRequest request) {
        String lobbyCode = generateUniqueLobbyCode();

        Lobby lobby = Lobby.builder()
                .lobbyCode(lobbyCode)
                .hostUserId(request.getHostUserId())
                .hostUsername(request.getHostUsername())
                .title(request.getTitle())
                .maxParticipants(request.getMaxParticipants())
                .currentCount(1)
                .status(LobbyStatus.WAITING)
                .createdAt(LocalDateTime.now())
                .lastActivityAt(LocalDateTime.now())
                .build();

        lobby = lobbyRepository.save(lobby);

        // Host auto-joins as participant
        LobbyParticipant host = LobbyParticipant.builder()
                .lobby(lobby)
                .userId(request.getHostUserId())
                .username(request.getHostUsername())
                .joinedAt(LocalDateTime.now())
                .active(true)
                .build();

        participantRepository.save(host);
        return mapToLobbyResponse(lobby);
    }

    // JOIN LOBBY
    @Transactional
    public LobbyResponse joinLobby(JoinLobbyRequest request) {
        Lobby lobby = findLobbyByCode(request.getLobbyCode());

        if (lobby.getStatus() == LobbyStatus.ENDED) {
            throw new LobbyException("This lobby has already ended", 400);
        }
        if (participantRepository.existsByLobbyAndUserId(lobby, request.getUserId())) {
            throw new LobbyException("You have already joined this lobby", 400);
        }
        if (lobby.getCurrentCount() >= lobby.getMaxParticipants()) {
            throw new LobbyException("Lobby is full", 400);
        }

        LobbyParticipant participant = LobbyParticipant.builder()
                .lobby(lobby)
                .userId(request.getUserId())
                .username(request.getUsername())
                .joinedAt(LocalDateTime.now())
                .active(true)
                .build();

        participantRepository.save(participant);

        lobby.setCurrentCount(lobby.getCurrentCount() + 1);
        lobby.setLastActivityAt(LocalDateTime.now());
        lobby = lobbyRepository.save(lobby);

        // Notify host via WebSocket
        messagingTemplate.convertAndSend(
                "/topic/lobby/" + lobby.getLobbyCode() + "/notifications",
                request.getUsername() + " has joined the lobby!"
        );

        return mapToLobbyResponse(lobby);
    }

    // START SESSION
    @Transactional
    public LobbyResponse startSession(String lobbyCode, String requestingUserId) {
        Lobby lobby = findLobbyByCode(lobbyCode);

        if (!lobby.getHostUserId().equals(requestingUserId)) {
            throw new LobbyException("Only the host can start the session", 403);
        }
        if (lobby.getStatus() != LobbyStatus.WAITING) {
            throw new LobbyException("Lobby must be in WAITING state to start", 400);
        }

        lobby.setStatus(LobbyStatus.ACTIVE);
        lobby.setStartedAt(LocalDateTime.now());
        lobby.setLastActivityAt(LocalDateTime.now());
        lobby = lobbyRepository.save(lobby);

        messagingTemplate.convertAndSend("/topic/lobby/" + lobbyCode + "/status", "SESSION_STARTED");

        return mapToLobbyResponse(lobby);
    }

    //END SESSION
    @Transactional
    public LobbyResponse endSession(String lobbyCode, String requestingUserId) {
        Lobby lobby = findLobbyByCode(lobbyCode);

        if (!lobby.getHostUserId().equals(requestingUserId)) {
            throw new LobbyException("Only the host can end the session", 403);
        }
        if (lobby.getStatus() == LobbyStatus.ENDED) {
            throw new LobbyException("Lobby is already ended", 400);
        }

        lobby.setStatus(LobbyStatus.ENDED);
        lobby.setEndedAt(LocalDateTime.now());
        lobby = lobbyRepository.save(lobby);

        messagingTemplate.convertAndSend("/topic/lobby/" + lobbyCode + "/status", "SESSION_ENDED");

        return mapToLobbyResponse(lobby);
    }

    //LEAVE LOBBY
    @Transactional
    public void leaveLobby(String lobbyCode, String userId) {
        Lobby lobby = findLobbyByCode(lobbyCode);

        LobbyParticipant participant = participantRepository
                .findByLobbyAndUserId(lobby, userId)
                .orElseThrow(() -> new LobbyException("You are not a participant in this lobby", 400));

        if (!participant.isActive()) {
            throw new LobbyException("You have already left this lobby", 400);
        }

        participant.setActive(false);
        participantRepository.save(participant);

        lobby.setCurrentCount(Math.max(0, lobby.getCurrentCount() - 1));
        lobby.setLastActivityAt(LocalDateTime.now());
        lobbyRepository.save(lobby);

        messagingTemplate.convertAndSend(
                "/topic/lobby/" + lobbyCode + "/notifications",
                participant.getUsername() + " has left the lobby."
        );
    }

    //GET LOBBY
    public LobbyResponse getLobbyByCode(String lobbyCode) {
        return mapToLobbyResponse(findLobbyByCode(lobbyCode));
    }

    // GET PARTICIPANTS
    public List<ParticipantResponse> getParticipants(String lobbyCode) {
        Lobby lobby = findLobbyByCode(lobbyCode);
        return participantRepository.findByLobbyAndActive(lobby, true)
                .stream()
                .map(this::mapToParticipantResponse)
                .collect(Collectors.toList());
    }

    //SEND CHAT MESSAGE (REST fallback)
    @Transactional
    public ChatMessageResponse sendMessage(String lobbyCode, SendMessageRequest request) {
        Lobby lobby = findLobbyByCode(lobbyCode);

        if (lobby.getStatus() == LobbyStatus.ENDED) {
            throw new LobbyException("Cannot send messages to an ended lobby", 400);
        }
        if (!participantRepository.existsByLobbyAndUserId(lobby, request.getSenderId())) {
            throw new LobbyException("You are not a participant in this lobby", 403);
        }

        ChatMessage message = ChatMessage.builder()
                .lobby(lobby)
                .senderId(request.getSenderId())
                .senderUsername(request.getSenderUsername())
                .content(request.getContent())
                .sentAt(LocalDateTime.now())
                .build();

        message = chatMessageRepository.save(message);
        lobby.setLastActivityAt(LocalDateTime.now());
        lobbyRepository.save(lobby);

        ChatMessageResponse response = mapToChatMessageResponse(message, lobbyCode);

        // Broadcast to all WebSocket subscribers
        messagingTemplate.convertAndSend("/topic/lobby/" + lobbyCode + "/chat", response);

        return response;
    }

    //GET CHAT HISTORY
    public List<ChatMessageResponse> getChatHistory(String lobbyCode) {
        Lobby lobby = findLobbyByCode(lobbyCode);
        return chatMessageRepository.findByLobbyOrderBySentAtAsc(lobby)
                .stream()
                .map(msg -> mapToChatMessageResponse(msg, lobbyCode))
                .collect(Collectors.toList());
    }

    // GET ALL LOBBIES
    public List<LobbyResponse> getAllLobbies() {
        return lobbyRepository.findAll()
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::mapToLobbyResponse)
                .collect(Collectors.toList());
    }

    // DELETE LOBBY
    @Transactional
    public void deleteLobby(String lobbyCode, String userId) {
        Lobby lobby = findLobbyByCode(lobbyCode);

        // Only host can delete the lobby
        if (!lobby.getHostUserId().equals(userId)) {
            throw new LobbyException("Only the lobby host can delete this lobby", 403);
        }

        // Delete all chat messages first
        chatMessageRepository.deleteByLobby(lobby);

        // Delete all participants
        participantRepository.deleteByLobby(lobby);

        // Finally delete the lobby
        lobbyRepository.delete(lobby);
    }

    // HELPERS

    private Lobby findLobbyByCode(String lobbyCode) {
        return lobbyRepository.findByLobbyCode(lobbyCode)
                .orElseThrow(() -> new LobbyException("Lobby not found with code: " + lobbyCode, 404));
    }

    private String generateUniqueLobbyCode() {
        String code;
        do {
            code = String.format("%06d", new Random().nextInt(1_000_000));
        } while (lobbyRepository.existsByLobbyCode(code));
        return code;
    }

    private LobbyResponse mapToLobbyResponse(Lobby lobby) {
        return LobbyResponse.builder()
                .id(lobby.getId())
                .lobbyCode(lobby.getLobbyCode())
                .hostUserId(lobby.getHostUserId())
                .hostUsername(lobby.getHostUsername())
                .title(lobby.getTitle())
                .maxParticipants(lobby.getMaxParticipants())
                .currentCount(lobby.getCurrentCount())
                .status(lobby.getStatus())
                .isFull(lobby.getCurrentCount() >= lobby.getMaxParticipants())
                .createdAt(lobby.getCreatedAt())
                .startedAt(lobby.getStartedAt())
                .endedAt(lobby.getEndedAt())
                .build();
    }

    private ParticipantResponse mapToParticipantResponse(LobbyParticipant p) {
        return ParticipantResponse.builder()
                .id(p.getId())
                .userId(p.getUserId())
                .username(p.getUsername())
                .joinedAt(p.getJoinedAt())
                .active(p.isActive())
                .build();
    }

    private ChatMessageResponse mapToChatMessageResponse(ChatMessage msg, String lobbyCode) {
        return ChatMessageResponse.builder()
                .id(msg.getId())
                .lobbyCode(lobbyCode)
                .senderId(msg.getSenderId())
                .senderUsername(msg.getSenderUsername())
                .content(msg.getContent())
                .sentAt(msg.getSentAt())
                .build();
    }
}
