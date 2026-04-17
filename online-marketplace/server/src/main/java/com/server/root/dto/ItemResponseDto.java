package com.server.root.dto;

import com.server.root.common.Constants;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemResponseDto {
    private UUID itemId;
    private Constants.ItemsCategory itemCategory;
    private String title;
    private String description;
    private Double price;
    private String imageUrl;
    private Constants.ItemStatus status;
    private UUID sellerId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
