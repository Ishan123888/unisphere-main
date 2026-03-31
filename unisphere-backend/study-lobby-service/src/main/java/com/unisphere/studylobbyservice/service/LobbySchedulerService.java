package com.unisphere.studylobbyservice.service;

import com.unisphere.studylobbyservice.entity.Lobby;
import com.unisphere.studylobbyservice.enums.LobbyStatus;
import com.unisphere.studylobbyservice.repository.LobbyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LobbySchedulerService {

    private final LobbyRepository lobbyRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // Runs every 60 seconds - auto-expires lobbies with 30 min inactivity
    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void expireInactiveLobbies() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(30);

        List<Lobby> waitingExpired = lobbyRepository
                .findByStatusAndLastActivityAtBefore(LobbyStatus.WAITING, cutoff);
        List<Lobby> activeExpired = lobbyRepository
                .findByStatusAndLastActivityAtBefore(LobbyStatus.ACTIVE, cutoff);

        waitingExpired.forEach(this::expireLobby);
        activeExpired.forEach(this::expireLobby);

        int total = waitingExpired.size() + activeExpired.size();
        if (total > 0) {
            log.info("Auto-expired {} inactive lobbies", total);
        }
    }

    private void expireLobby(Lobby lobby) {
        lobby.setStatus(LobbyStatus.ENDED);
        lobby.setEndedAt(LocalDateTime.now());
        lobbyRepository.save(lobby);
        messagingTemplate.convertAndSend(
                "/topic/lobby/" + lobby.getLobbyCode() + "/status",
                "SESSION_EXPIRED"
        );
        log.info("Lobby {} expired due to inactivity", lobby.getLobbyCode());
    }
}
