"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ShoppingCart, Tag, User, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { ItemResponseDto, ItemStatus } from "@/types";
import { marketplaceService } from "@/lib/services/marketplaceService";
import { formatPrice, formatDate, formatCategory, getImageUrl, getSellerId } from "@/lib/utils";

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<ItemResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sellerId = getSellerId();
  const isOwner = item?.sellerId === sellerId;

  useEffect(() => {
    if (!id) return;
    marketplaceService.getItemById(id as string)
      .then(setItem)
      .catch(() => setError("Item not found."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  if (error || !item) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">{error || "Item not found"}</p>
        <button onClick={() => router.push("/marketplace")} className="mt-4 text-blue-600 hover:underline">
          Back to Marketplace
        </button>
      </div>
    </div>
  );

  const statusColors: Record<ItemStatus, string> = {
    AVAILABLE: "bg-green-100 text-green-800 border-green-200",
    LOCKED: "bg-yellow-100 text-yellow-800 border-yellow-200",
    SOLD: "bg-gray-100 text-gray-600 border-gray-200",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button onClick={() => router.push("/marketplace")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-5 h-5" /> Back to Marketplace
        </button>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image */}
            <div className="relative h-80 md:h-full min-h-[320px] bg-gray-100">
              <img src={getImageUrl(item.imageUrl)} alt={item.title}
                className="w-full h-full object-cover" />
              <span className={`absolute top-4 left-4 px-3 py-1 text-sm font-semibold rounded-full border ${statusColors[item.status]}`}>
                {item.status}
              </span>
            </div>

            {/* Details */}
            <div className="p-8 flex flex-col">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit mb-3">
                <Tag className="w-3 h-3" />{formatCategory(item.itemCategory)}
              </span>

              <h1 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h1>
              <p className="text-gray-600 mb-6 leading-relaxed">{item.description}</p>

              <div className="text-3xl font-bold text-blue-600 mb-6">{formatPrice(item.price)}</div>

              <div className="space-y-2 text-sm text-gray-500 mb-8">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Seller: <code className="font-mono text-gray-700">{item.sellerId.substring(0, 12)}...</code></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Listed {formatDate(item.createdAt)}</span>
                </div>
              </div>

              <div className="mt-auto space-y-3">
                {item.status === ItemStatus.AVAILABLE && !isOwner && (
                  <button
                    onClick={() => router.push(`/checkout?itemId=${item.itemId}`)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2">
                    <ShoppingCart className="w-5 h-5" /> Proceed to Checkout
                  </button>
                )}
                {item.status === ItemStatus.LOCKED && (
                  <div className="w-full bg-yellow-50 border border-yellow-200 text-yellow-800 font-semibold py-3 px-6 rounded-xl text-center">
                    🔒 Payment in Progress
                  </div>
                )}
                {item.status === ItemStatus.SOLD && (
                  <div className="w-full bg-gray-100 border border-gray-200 text-gray-500 font-semibold py-3 px-6 rounded-xl text-center">
                    ✓ Sold
                  </div>
                )}
                {isOwner && (
                  <button onClick={() => router.push(`/edit-item?id=${item.itemId}`)}
                    className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-xl transition-colors">
                    Edit Listing
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Flow Info */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">How It Works</h3>
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { label: "Available", color: "bg-green-100 text-green-800", desc: "Listed & ready" },
              { label: "→", color: "", desc: "" },
              { label: "Locked", color: "bg-yellow-100 text-yellow-800", desc: "Payment processing" },
              { label: "→", color: "", desc: "" },
              { label: "Sold", color: "bg-gray-100 text-gray-700", desc: "Transaction complete" },
            ].map((s, i) => s.label === "→" ? (
              <span key={i} className="text-gray-400 font-bold text-lg">→</span>
            ) : (
              <div key={i} className="text-center">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${s.color}`}>{s.label}</span>
                <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
