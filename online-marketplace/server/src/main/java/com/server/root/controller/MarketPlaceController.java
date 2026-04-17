package com.server.root.controller;

import com.server.root.common.Constants;
import com.server.root.dto.ItemRequestDto;
import com.server.root.dto.ItemResponseDto;
import com.server.root.service.MarketPlaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/marketplace")
@RequiredArgsConstructor
@Slf4j
public class MarketPlaceController {

    private final MarketPlaceService marketPlaceService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = "application/json")
    public ResponseEntity<ItemResponseDto> createItem(
            @RequestPart("items") @Valid ItemRequestDto requestDto,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        log.info("DTO: {}", requestDto);
        log.info("Image: {}", image.getOriginalFilename());
        log.info("REST request to create item: {}", requestDto.getTitle());
        return new ResponseEntity<>(marketPlaceService.createItem(requestDto, image), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ItemResponseDto>> getAllItems() {
        log.info("REST request to get all items");
        return ResponseEntity.ok(marketPlaceService.getAllItems());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemResponseDto> getItemById(@PathVariable UUID id) {
        log.info("REST request to get item: {}", id);
        return ResponseEntity.ok(marketPlaceService.getItemById(id));
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<ItemResponseDto>> getItemsBySellerId(@PathVariable UUID sellerId) {
        log.info("REST request to get items by seller: {}", sellerId);
        return ResponseEntity.ok(marketPlaceService.getItemsBySellerId(sellerId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemResponseDto> updateItem(
            @PathVariable UUID id,
            @Valid @RequestBody ItemRequestDto requestDto) {
        log.info("REST request to update item: {}", id);
        return ResponseEntity.ok(marketPlaceService.updateItem(id, requestDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable UUID id, @RequestParam UUID sellerId) {
        log.info("REST request to delete item: {} by seller: {}", id, sellerId);
        marketPlaceService.deleteItem(id, sellerId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<ItemResponseDto>> searchItems(
            @RequestParam(required = false) Constants.ItemStatus status,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String keyword) {
        log.info("REST request to search items");
        return ResponseEntity.ok(marketPlaceService.searchItems(status, minPrice, maxPrice, keyword));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ItemResponseDto> updateItemStatus(
            @PathVariable UUID id,
            @RequestParam Constants.ItemStatus status,
            @RequestParam UUID sellerId) {
        log.info("REST request to update status of item: {} to {}", id, status);
        return ResponseEntity.ok(marketPlaceService.updateItemStatus(id, status, sellerId));
    }
}
