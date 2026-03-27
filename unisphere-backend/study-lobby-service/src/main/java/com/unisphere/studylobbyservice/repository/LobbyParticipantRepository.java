package com.unisphere.studylobbyservice.repository;

import com.unisphere.studylobbyservice.entity.Lobby;
import com.unisphere.studylobbyservice.entity.LobbyParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LobbyParticipantRepository extends JpaRepository<LobbyParticipant, Long> {
    Optional<LobbyParticipant> findByLobbyAndUserId(Lobby lobby, String userId);
    List<LobbyParticipant> findByLobbyAndActive(Lobby lobby, boolean active);
    boolean existsByLobbyAndUserId(Lobby lobby, String userId);
    void deleteByLobby(Lobby lobby);
}
