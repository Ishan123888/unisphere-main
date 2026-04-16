package com.unisphere.studylobbyservice.repository;

import com.unisphere.studylobbyservice.entity.Lobby;
import com.unisphere.studylobbyservice.enums.LobbyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LobbyRepository extends JpaRepository<Lobby, Long> {
    Optional<Lobby> findByLobbyCode(String lobbyCode);
    boolean existsByLobbyCode(String lobbyCode);
    List<Lobby> findByStatusAndLastActivityAtBefore(LobbyStatus status, LocalDateTime dateTime);
}
