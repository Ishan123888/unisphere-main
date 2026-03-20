package com.unisphere.studylobbyservice.entity;

import com.unisphere.studylobbyservice.enums.LobbyStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lobbies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lobby {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 6)
    private String lobbyCode;

    @Column(nullable = false)
    private String hostUserId;

    @Column(nullable = false)
    private String hostUsername;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private int maxParticipants;

    @Column(nullable = false)
    private int currentCount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LobbyStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime lastActivityAt;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;

    @OneToMany(mappedBy = "lobby", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<LobbyParticipant> participants = new ArrayList<>();

    @OneToMany(mappedBy = "lobby", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ChatMessage> messages = new ArrayList<>();
}
