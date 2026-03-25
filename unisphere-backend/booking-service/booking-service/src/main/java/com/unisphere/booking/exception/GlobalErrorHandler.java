package com.unisphere.booking.exception;

import com.unisphere.booking.dto.APIResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalErrorHandler {

    /* ── 404 Not Found ─────────────────────────────────────────────── */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<APIResponse<Void>> handleRuntime(RuntimeException ex) {
        String msg = ex.getMessage();
        if (msg != null && msg.contains("not found")) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(APIResponse.error(msg));
        }
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(APIResponse.error("An unexpected error occurred: " + msg));
    }

    /* ── 400 Bad Request ────────────────────────────────────────────── */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<APIResponse<Void>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(APIResponse.error("Bad request: " + ex.getMessage()));
    }

    /* ── 500 Generic ────────────────────────────────────────────────── */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<APIResponse<Void>> handleGeneric(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(APIResponse.error("Server error: " + ex.getMessage()));
    }
}