package com.unisphere.studylobbyservice.enums;

public enum LobbyStatus {
    WAITING,   // lobby created, waiting for host to start
    ACTIVE,    // session is live
    ENDED      // session finished or auto-expired
}
