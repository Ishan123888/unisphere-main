"use client";

import React, { useState, useCallback } from "react";
import { Search, Filter, X } from "lucide-react";
import { ItemCategory } from "@/types";
import { formatCategory } from "@/lib/utils";

interface ItemFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  isLoading?: boolean;
}

export interface FilterState {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
}

/**
 * Item Filters Component
 * Provides filtering and search functionality
 */
export const ItemFilters: React.FC<ItemFiltersProps> = ({
  onFilterChange,
  isLoading = false,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
  });

  const [isExpanded, setIsExpanded] = useState(true);

  /**
   * Handle filter changes
   */
  const handleFilterChange = useCallback(
    (updatedFilters: Partial<FilterState>) => {
      const newFilters = { ...filters, ...updatedFilters };
      setFilters(newFilters);
      onFilterChange(newFilters);
    },
    [filters, onFilterChange]
  );

  /**
   * Reset all filters
   */
  const handleReset = useCallback(() => {
    const resetFilters: FilterState = {
      search: "",
      category: "",
      minPrice: "",
      maxPrice: "",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  }, [onFilterChange]);

  const isFiltered =
    filters.search ||
    filters.category ||
    filters.minPrice ||
    filters.maxPrice;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Filter Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? "−" : "+"}
        </button>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="px-6 py-4 space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search items..."
                value={filters.search}
                onChange={(e) =>
                  handleFilterChange({ search: e.target.value })
                }
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) =>
                handleFilterChange({ category: e.target.value })
              }
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer text-gray-900"
            >
              <option value="">All Categories</option>
              {Object.values(ItemCategory).map((category) => (
                <option key={category} value={category}>
                  {formatCategory(category)}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Price
              </label>
              <input
                type="number"
                placeholder="0"
                min="0"
                value={filters.minPrice}
                onChange={(e) =>
                  handleFilterChange({ minPrice: e.target.value })
                }
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price
              </label>
              <input
                type="number"
                placeholder="∞"
                min="0"
                value={filters.maxPrice}
                onChange={(e) =>
                  handleFilterChange({ maxPrice: e.target.value })
                }
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          {/* Reset Button */}
          {isFiltered && (
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};
