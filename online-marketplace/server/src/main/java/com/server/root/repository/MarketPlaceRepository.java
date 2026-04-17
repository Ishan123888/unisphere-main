package com.server.root.repository;
import com.server.root.common.Constants;
import com.server.root.entity.MarketPlaceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MarketPlaceRepository extends JpaRepository<MarketPlaceEntity, UUID> {
    
    boolean existsByTitleAndSellerId(String title, UUID sellerId);
    
    List<MarketPlaceEntity> findBySellerId(UUID sellerId);

    @Query("SELECT m FROM MarketPlaceEntity m WHERE " +
           "(:status IS NULL OR m.status = :status) AND " +
           "(:minPrice IS NULL OR m.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR m.price <= :maxPrice) AND " +
           "(:keyword IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(m.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<MarketPlaceEntity> searchItems(
            @Param("status") Constants.ItemStatus status,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("keyword") String keyword);
}
