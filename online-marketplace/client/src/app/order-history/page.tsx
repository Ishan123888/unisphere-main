"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Download, ArrowLeft, Package } from "lucide-react";
import { formatPrice, formatDate, formatCategory, getImageUrl } from "@/lib/utils";

interface Order {
  orderId: string;
  itemId: string;
  title: string;
  category: string;
  price: number;
  imageUrl: string;
  buyerName: string;
  buyerEmail: string;
  sellerId: string;
  purchasedAt: string;
  status: string;
}

export default function OrderHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const stored: Order[] = JSON.parse(localStorage.getItem("orders") || "[]");
    setOrders(stored.reverse());
  }, []);

  const handleDownloadInvoice = (order: Order) => {
    const content = `
UNISPHERE MARKETPLACE - INVOICE
================================
Order ID:    ${order.orderId}
Date:        ${formatDate(order.purchasedAt)}
Status:      ${order.status}

ITEM DETAILS
------------
Title:       ${order.title}
Category:    ${formatCategory(order.category)}
Price:       ${formatPrice(order.price)}

BUYER DETAILS
-------------
Name:        ${order.buyerName}
Email:       ${order.buyerEmail}

================================
Thank you for your purchase!
UniSphere Student Marketplace
    `.trim();
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${order.orderId.substring(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalSpent = orders.reduce((sum, o) => sum + o.price, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => router.push("/marketplace")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-5 h-5" /> Back to Marketplace
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
            <p className="text-gray-500 mt-1">{orders.length} order{orders.length !== 1 ? "s" : ""} · Total spent: <strong className="text-blue-600">{formatPrice(totalSpent)}</strong></p>
          </div>
          <ShoppingBag className="w-8 h-8 text-blue-600" />
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Browse the marketplace and make your first purchase.</p>
            <button onClick={() => router.push("/marketplace")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              Browse Marketplace
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.orderId} className="bg-white rounded-2xl shadow-sm p-6 flex gap-4 items-start">
                <img src={getImageUrl(order.imageUrl)} alt={order.title}
                  className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{order.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{formatCategory(order.category)}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex-shrink-0">
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 mt-3 text-sm text-gray-500">
                    <span>Purchased {formatDate(order.purchasedAt)}</span>
                    <span className="font-bold text-blue-600 text-base">{formatPrice(order.price)}</span>
                  </div>
                  <div className="mt-3 flex gap-3">
                    <button onClick={() => handleDownloadInvoice(order)}
                      className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                      <Download className="w-3.5 h-3.5" /> Download Invoice
                    </button>
                    <button onClick={() => router.push(`/item/${order.itemId}`)}
                      className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800 font-medium border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors">
                      View Item
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
