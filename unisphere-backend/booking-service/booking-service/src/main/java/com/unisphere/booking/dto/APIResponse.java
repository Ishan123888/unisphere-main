package com.unisphere.booking.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class APIResponse<T> {

    private boolean success;
    private String message;
    private T data;

    public static <T> APIResponse<T> ok(String message, T data) {
        return APIResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> APIResponse<T> error(String message) {
        return APIResponse.<T>builder()
                .success(false)
                .message(message)
                .data(null)
                .build();
    }
}