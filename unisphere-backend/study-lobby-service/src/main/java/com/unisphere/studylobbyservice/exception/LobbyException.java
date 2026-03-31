package com.unisphere.studylobbyservice.exception;

import lombok.Getter;

@Getter
public class LobbyException extends RuntimeException {
    private final int statusCode;

    public LobbyException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
