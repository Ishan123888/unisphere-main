"use client";

import React from "react";
import { ShoppingCart, Tag, User } from "lucide-react";
import { ItemResponseDto } from "@/types";
import { formatPrice, formatDate, formatCategory, getImageUrl } from "@/lib/utils";

interface ItemCardProps {
  item: ItemResponseDto;
  onViewDetails?: (itemId: string) => void;
}

/**
 * Item Card Component
 * Displays individual marketplace item
 */
export const ItemCard: React.FC<ItemCardProps> = ({ item, onViewDetails }) => {
  const handleCardClick = () => {
    onViewDetails?.(item.itemId);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer group"
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
        <img
          src={getImageUrl(item.imageUrl)}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${
              item.status === "AVAILABLE"
                ? "bg-green-100 text-green-800"
                : item.status === "LOCKED"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
            }`}
          >
            {item.status}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-4 flex flex-col">
        {/* Category Badge */}
        <div className="mb-2">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
            <Tag className="w-3 h-3" />
            {formatCategory(item.itemCategory)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600">
          {item.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {item.description}
        </p>

        {/* Price and Seller */}
        <div className="border-t pt-3 mt-4">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-xs text-gray-500 mb-1">Price</p>
              <p className="text-xl font-bold text-gray-900">
                {formatPrice(item.price)} USD
              </p>
            </div>
          </div>

          {/* Seller Info */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <User className="w-3 h-3" />
            <span>Sold by</span>
            <span className="font-mono text-gray-700">
              {item.sellerId.substring(0, 8)}...
            </span>
          </div>

          {/* Created Date */}
          <p className="text-xs text-gray-400 mb-4">
            Listed {formatDate(item.createdAt)}
          </p>
        </div>

        {/* Add to Cart Button */}
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implement add to cart
          }}
        >
          <ShoppingCart className="w-4 h-4" />
          View Details
        </button>
      </div>
    </div>
  );
};
