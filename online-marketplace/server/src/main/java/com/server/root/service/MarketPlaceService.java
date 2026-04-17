package com.server.root.service;

import com.server.root.common.Constants;
import com.server.root.dto.ItemRequestDto;
import com.server.root.dto.ItemResponseDto;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface MarketPlaceService {
    ItemResponseDto createItem(ItemRequestDto itemRequestDto, MultipartFile image);

    String uploadImage(MultipartFile file);

    List<ItemResponseDto> getAllItems();

    List<ItemResponseDto> getItemsBySellerId(UUID sellerId);

    ItemResponseDto getItemById(UUID id);

    ItemResponseDto updateItem(UUID id, ItemRequestDto itemRequestDto);

    void deleteItem(UUID id, UUID sellerId);

    List<ItemResponseDto> searchItems(Constants.ItemStatus status, Double minPrice, Double maxPrice, String keyword);

    ItemResponseDto updateItemStatus(UUID id, Constants.ItemStatus newStatus, UUID sellerId);
}
