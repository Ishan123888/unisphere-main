"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Download, ShoppingBag, Home } from "lucide-react";
import { formatPrice, formatDate, formatCategory } from "@/lib/utils";

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

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const orders: Order[] = JSON.parse(localStorage.getItem("orders") || "[]");
    const found = orders.find(o => o.orderId === orderId);
    setOrder(found || null);
  }, [orderId]);

  const handleDownloadInvoice = () => {
    if (!order) return;
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

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 mb-4">Order not found.</p>
        <button onClick={() => router.push("/marketplace")} className="text-blue-600 hover:underline">
          Back to Marketplace
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-md p-8 text-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-500 mb-6">Your order has been confirmed. A confirmation has been sent to <strong>{order.buyerEmail}</strong>.</p>

          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Order ID</span>
              <span className="font-mono text-gray-800 text-xs">{order.orderId.substring(0, 16)}...</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Item</span>
              <span className="font-medium text-gray-800">{order.title}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Category</span>
              <span className="text-gray-800">{formatCategory(order.category)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Date</span>
              <span className="text-gray-800">{formatDate(order.purchasedAt)}</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-3">
              <span className="text-gray-700">Total Paid</span>
              <span className="text-blue-600 text-lg">{formatPrice(order.price)}</span>
            </div>
          </div>

          {/* Status Flow */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Available</span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">Locked</span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold ring-2 ring-blue-300">Sold ✓</span>
          </div>

          <div className="flex gap-3">
            <button onClick={handleDownloadInvoice}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-xl transition-colors">
              <Download className="w-4 h-4" /> Invoice
            </button>
            <button onClick={() => router.push("/order-history")}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors">
              <ShoppingBag className="w-4 h-4" /> My Orders
            </button>
          </div>
        </div>

        <button onClick={() => router.push("/marketplace")}
          className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 font-medium py-3">
          <Home className="w-4 h-4" /> Continue Shopping
        </button>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
