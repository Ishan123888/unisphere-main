package com.server.root.mapper;

import com.server.root.dto.ItemRequestDto;
import com.server.root.dto.ItemResponseDto;
import com.server.root.entity.MarketPlaceEntity;

public class MarketPlaceDTOEntityMapper {

    public static ItemResponseDto toResponseDto(MarketPlaceEntity entity) {
        if (entity == null) {
            return null;
        }

        return ItemResponseDto.builder()
                .itemId(entity.getItemId())
                .itemCategory(entity.getItemCategory())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .price(entity.getPrice())
                .imageUrl(entity.getImageUrl())
                .status(entity.getStatus())
                .sellerId(entity.getSellerId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public static MarketPlaceEntity toEntity(ItemRequestDto requestDto) {
        if (requestDto == null) {
            return null;
        }

        return MarketPlaceEntity.builder()
                .itemCategory(requestDto.getItemCategory())
                .title(requestDto.getTitle())
                .description(requestDto.getDescription())
                .price(requestDto.getPrice())
                .imageUrl(requestDto.getImageUrl())
                .sellerId(requestDto.getSellerId())
                .build();
    }
}
