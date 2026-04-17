package com.server.root.service;

import com.server.root.common.Constants;
import com.server.root.dto.ItemRequestDto;
import com.server.root.dto.ItemResponseDto;
import com.server.root.entity.MarketPlaceEntity;
import com.server.root.exception.FileStorageException;
import com.server.root.exception.InvalidItemStateException;
import com.server.root.exception.ItemNotFoundException;
import com.server.root.exception.UnauthorizedActionException;
import com.server.root.mapper.MarketPlaceDTOEntityMapper;
import com.server.root.repository.MarketPlaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class MarketPlaceServiceImpl implements MarketPlaceService {

    private final MarketPlaceRepository repository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    @Transactional
    public ItemResponseDto createItem(ItemRequestDto request, MultipartFile image) {
        log.info("Creating new item: {} for seller: {}", request.getTitle(), request.getSellerId());

        // 1. Verify user (Assume validation via User Service API is handled elsewhere or via interceptor)
        // For now, we assume the sellerId provided is of a verified user.

        // 2. Prevent duplicate listings (same title + sellerId)
        if (repository.existsByTitleAndSellerId(request.getTitle(), request.getSellerId())) {
            log.error("Item with title {} already exists for seller {}", request.getTitle(), request.getSellerId());
            throw new InvalidItemStateException("You already have an item with this title.");
        }

        // 3. Handle image upload if provided
        if (image != null && !image.isEmpty()) {
            String imageUrl = uploadImage(image);
            request.setImageUrl(imageUrl);
        }

        MarketPlaceEntity entity = MarketPlaceDTOEntityMapper.toEntity(request);
        entity.setStatus(Constants.ItemStatus.AVAILABLE); // Default status

        MarketPlaceEntity savedEntity = repository.save(entity);
        log.info("Item created successfully with ID: {}", savedEntity.getItemId());
        return MarketPlaceDTOEntityMapper.toResponseDto(savedEntity);
    }

    @Override
    public String uploadImage(MultipartFile file) {
        log.info("Uploading image: {}", file.getOriginalFilename());

        if (file.isEmpty()) {
            throw new FileStorageException("Failed to store empty file.");
        }

        try {
            String fileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
            // Check if file name contains invalid characters
            if (fileName.contains("..")) {
                throw new FileStorageException("Filename contains invalid path sequence " + fileName);
            }

            // Create unique filename to prevent overwriting
            String extension = "";
            int i = fileName.lastIndexOf('.');
            if (i > 0) {
                extension = fileName.substring(i);
            }
            String newFileName = UUID.randomUUID().toString() + extension;

            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(newFileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            log.info("Image uploaded successfully: {}", newFileName);
            // Return the full URL path for accessing the image
            return "/api/v1/uploads/" + newFileName;

        } catch (IOException e) {
            log.error("Could not store file", e);
            throw new FileStorageException("Could not store file. Please try again!", e);
        }
    }

    @Override
    public List<ItemResponseDto> getAllItems() {
        log.info("Fetching all items");
        return repository.findAll().stream()
                .map(MarketPlaceDTOEntityMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ItemResponseDto> getItemsBySellerId(UUID sellerId) {
        log.info("Fetching items for seller ID: {}", sellerId);
        return repository.findBySellerId(sellerId).stream()
                .map(MarketPlaceDTOEntityMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public ItemResponseDto getItemById(UUID id) {
        log.info("Fetching item with ID: {}", id);
        return repository.findById(id)
                .map(MarketPlaceDTOEntityMapper::toResponseDto)
                .orElseThrow(() -> new ItemNotFoundException("Item not found with id: " + id));
    }

    @Override
    @Transactional
    public ItemResponseDto updateItem(UUID id, ItemRequestDto request) {
        log.info("Updating item ID: {}", id);
        MarketPlaceEntity entity = repository.findById(id)
                .orElseThrow(() -> new ItemNotFoundException("Item not found with id: " + id));

        // Only the seller can update their item
        if (!entity.getSellerId().equals(request.getSellerId())) {
            log.error("Unauthorized attempt to update item {} by user {}", id, request.getSellerId());
            throw new UnauthorizedActionException("Only the seller can update this item.");
        }

        entity.setTitle(request.getTitle());
        entity.setDescription(request.getDescription());
        entity.setPrice(request.getPrice());
        entity.setItemCategory(request.getItemCategory());

        MarketPlaceEntity updatedEntity = repository.save(entity);
        log.info("Item updated successfully: {}", id);
        return MarketPlaceDTOEntityMapper.toResponseDto(updatedEntity);
    }

    @Override
    @Transactional
    public void deleteItem(UUID id, UUID sellerId) {
        log.info("Deleting item ID: {} requested by user: {}", id, sellerId);
        MarketPlaceEntity entity = repository.findById(id)
                .orElseThrow(() -> new ItemNotFoundException("Item not found with id: " + id));

        // Only the seller can delete their item
        if (!entity.getSellerId().equals(sellerId)) {
            log.error("Unauthorized attempt to delete item {} by user {}", id, sellerId);
            throw new UnauthorizedActionException("Only the seller can delete this item.");
        }

        repository.delete(entity);
        log.info("Item deleted successfully: {}", id);
    }

    @Override
    public List<ItemResponseDto> searchItems(Constants.ItemStatus status, Double minPrice, Double maxPrice, String keyword) {
        log.info("Searching items with status: {}, price range: {} - {}, keyword: {}", status, minPrice, maxPrice, keyword);
        return repository.searchItems(status, minPrice, maxPrice, keyword).stream()
                .map(MarketPlaceDTOEntityMapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ItemResponseDto updateItemStatus(UUID id, Constants.ItemStatus newStatus, UUID sellerId) {
        log.info("Updating status of item ID: {} to {}", id, newStatus);
        MarketPlaceEntity entity = repository.findById(id)
                .orElseThrow(() -> new ItemNotFoundException("Item not found with id: " + id));

        // Validate state transition
        validateStatusTransition(entity.getStatus(), newStatus);

        entity.setStatus(newStatus);
        MarketPlaceEntity updatedEntity = repository.save(entity);
        log.info("Item status updated successfully: {}", id);
        return MarketPlaceDTOEntityMapper.toResponseDto(updatedEntity);
    }

    private void validateStatusTransition(Constants.ItemStatus currentStatus, Constants.ItemStatus newStatus) {
        // Business Rules:
        // AVAILABLE → LOCKED → SOLD
        // LOCKED → AVAILABLE (if payment fails)
        
        boolean valid = false;
        if (currentStatus == Constants.ItemStatus.AVAILABLE && newStatus == Constants.ItemStatus.LOCKED) {
            valid = true;
        } else if (currentStatus == Constants.ItemStatus.LOCKED) {
            if (newStatus == Constants.ItemStatus.SOLD || newStatus == Constants.ItemStatus.AVAILABLE) {
                valid = true;
            }
        }
        
        if (!valid) {
            log.error("Invalid status transition from {} to {}", currentStatus, newStatus);
            throw new InvalidItemStateException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }
    }
}
