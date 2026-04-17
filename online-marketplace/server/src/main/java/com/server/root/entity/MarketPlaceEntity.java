package com.server.root.entity;

import com.server.root.common.Constants;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "marketplace")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketPlaceEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "item_id", unique = true, nullable = false)
    private UUID itemId;

    @Column(name = "category", nullable = false)
    @NotNull(message = "Category is required")
    @Enumerated(EnumType.STRING)
    private Constants.ItemsCategory itemCategory;

    @Column(name = "title", nullable = false)
    @NotBlank(message = "Title is required")
    private String title;

    @Column(name = "description", nullable = false)
    @NotBlank(message = "Description is required")
    private String description;

    @Column(name = "price", nullable = false)
    @NotNull(message = "Price is required")
    private Double price;

    @Column(name = "image_url", nullable = false)
    @NotBlank(message = "Image URL is required")
    private String imageUrl;

    @Column(name = "seller_id", nullable = false)
    @NotNull(message = "Seller ID is required")
    private UUID sellerId;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    @NotNull(message = "Status is required")
    private Constants.ItemStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = Constants.ItemStatus.AVAILABLE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
