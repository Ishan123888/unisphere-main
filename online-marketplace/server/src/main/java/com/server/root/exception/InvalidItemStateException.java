package com.server.root.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidItemStateException extends RuntimeException {
    public InvalidItemStateException(String message) {
        super(message);
    }
}
