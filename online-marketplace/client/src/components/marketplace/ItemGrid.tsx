"use client";

import React from "react";
import { ItemResponseDto } from "@/types";
import { ItemCard } from "@/components/marketplace/ItemCard";

interface ItemGridProps {
  items: ItemResponseDto[];
  isLoading?: boolean;
  isEmpty?: boolean;
  onViewDetails?: (itemId: string) => void;
}

/**
 * Item Grid Component
 * Responsive grid layout for marketplace items
 */
export const ItemGrid: React.FC<ItemGridProps> = ({
  items,
  isLoading = false,
  isEmpty = false,
  onViewDetails,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-gray-200 rounded-lg h-80 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 mb-2">
            No items found
          </p>
          <p className="text-gray-600">
            Try adjusting your filters or check back later
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <ItemCard
          key={item.itemId}
          item={item}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};
