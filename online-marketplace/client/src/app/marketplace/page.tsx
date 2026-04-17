"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, AlertCircle } from "lucide-react";
import { ItemResponseDto } from "@/types";
import { marketplaceService } from "@/lib/services/marketplaceService";
import { ItemGrid } from "@/components/marketplace/ItemGrid";
import { ItemFilters, FilterState } from "@/components/marketplace/ItemFilters";
import { Button } from "@/components/common/Button";
import { Toast } from "@/components/common/Toast";

/**
 * Marketplace Page
 * Displays all available items with filtering and search
 */
export default function MarketplacePage() {
  const [items, setItems] = useState<ItemResponseDto[]>([]);
  const [filteredItems, setFilteredItems] = useState<ItemResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
  });

  /**
   * Fetch all items on component mount
   */
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await marketplaceService.getAllItems();
        setItems(data);
        setFilteredItems(data);
      } catch (err) {
        setError("Failed to load marketplace items. Please try again later.");
        console.error("Error fetching items:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, []);

  /**
   * Apply filters to items
   */
  useEffect(() => {
    let result = [...items];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filters.category) {
      result = result.filter((item) => item.itemCategory === filters.category);
    }

    // Price range filter
    if (filters.minPrice) {
      result = result.filter(
        (item) => item.price >= parseFloat(filters.minPrice)
      );
    }

    if (filters.maxPrice) {
      result = result.filter(
        (item) => item.price <= parseFloat(filters.maxPrice)
      );
    }

    setFilteredItems(result);
  }, [items, filters]);

  /**
   * Handle filter changes
   */
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  /**
   * Handle item card click
   */
  const handleViewDetails = useCallback((itemId: string) => {
    // TODO: Navigate to item detail page
    console.log("View item details:", itemId);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
              <p className="text-gray-600 mt-1">
                Discover {items.length} amazing items
              </p>
            </div>
            <Link href="/create-item">
              <Button variant="primary" size="lg">
                <Plus className="w-5 h-5" />
                Sell Item
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ItemFilters
              onFilterChange={handleFilterChange}
              isLoading={isLoading}
            />
          </div>

          {/* Items Grid */}
          <div className="lg:col-span-3">
            {error && (
              <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Error Loading Items</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Results Summary */}
            {!isLoading && filteredItems.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{filteredItems.length}</span>{" "}
                  of <span className="font-semibold">{items.length}</span> items
                </p>
              </div>
            )}

            {/* Items Grid */}
            <ItemGrid
              items={filteredItems}
              isLoading={isLoading}
              isEmpty={!isLoading && filteredItems.length === 0}
              onViewDetails={handleViewDetails}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
