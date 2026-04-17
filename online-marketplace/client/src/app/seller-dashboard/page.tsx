"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, AlertCircle } from "lucide-react";
import { ItemResponseDto, ItemStatus } from "@/types";
import { marketplaceService } from "@/lib/services/marketplaceService";
import { getSellerId, formatPrice, formatDate, getImageUrl } from "@/lib/utils";
import { Button } from "@/components/common/Button";
import { Toast } from "@/components/common/Toast";

/**
 * Seller Dashboard Page
 * Manage seller's items
 */
export default function SellerDashboardPage() {
  const [items, setItems] = useState<ItemResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sellerId, setSellerId] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  /**
   * Fetch seller's items on mount
   */
  useEffect(() => {
    const id = getSellerId();
    setSellerId(id);

    const fetchItems = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await marketplaceService.getItemsBySellerId(id);
        setItems(data);
      } catch (err) {
        setError("Failed to load your items. Please try again later.");
        console.error("Error fetching seller items:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchItems();
    }
  }, []);

  /**
   * Handle item deletion
   */
  const handleDeleteItem = async (itemId: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      setDeletingId(itemId);
      await marketplaceService.deleteItem(itemId, sellerId);
      setItems(items.filter((item) => item.itemId !== itemId));
      setToast({
        type: "success",
        message: "Item deleted successfully",
      });
    } catch (err) {
      setToast({
        type: "error",
        message: "Failed to delete item. Please try again.",
      });
      console.error("Error deleting item:", err);
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Get status color
   */
  const getStatusColor = (status: ItemStatus) => {
    switch (status) {
      case ItemStatus.AVAILABLE:
        return "bg-green-100 text-green-800";
      case ItemStatus.LOCKED:
        return "bg-yellow-100 text-yellow-800";
      case ItemStatus.SOLD:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  /**
   * Get statistics
   */
  const stats = {
    total: items.length,
    available: items.filter((i) => i.status === ItemStatus.AVAILABLE).length,
    locked: items.filter((i) => i.status === ItemStatus.LOCKED).length,
    sold: items.filter((i) => i.status === ItemStatus.SOLD).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notifications */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Seller Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your marketplace listings
              </p>
            </div>
            <Link href="/create-item">
              <Button variant="primary" size="lg">
                <Plus className="w-5 h-5" />
                Add New Item
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm font-medium">Total Items</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.total}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-medium">Available</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats.available}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm font-medium">Locked</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {stats.locked}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-500">
            <p className="text-gray-600 text-sm font-medium">Sold</p>
            <p className="text-3xl font-bold text-gray-600 mt-2">
              {stats.sold}
            </p>
          </div>
        </div>

        {/* Seller ID */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            Your Seller ID:{" "}
            <code className="font-mono font-semibold">{sellerId}</code>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Items Table */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-12 text-center">
              <p className="text-gray-600 text-lg mb-4">
                You haven't added any items yet
              </p>
              <Link href="/create-item">
                <Button variant="primary">Create Your First Item</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Listed
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.itemId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={getImageUrl(item.imageUrl)}
                            alt={item.title}
                            className="h-10 w-10 object-cover rounded"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.itemCategory}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatPrice(item.price)}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-600">
                          {formatDate(item.createdAt)}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/edit-item?id=${item.itemId}`}>
                            <button
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                              title="Edit item"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDeleteItem(item.itemId)}
                            disabled={deletingId === item.itemId}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Delete item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
