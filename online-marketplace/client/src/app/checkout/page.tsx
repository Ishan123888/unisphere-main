"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Shield, AlertCircle, Lock } from "lucide-react";
import { ItemResponseDto } from "@/types";
import { marketplaceService } from "@/lib/services/marketplaceService";
import { formatPrice, formatCategory, getImageUrl, getSellerId, generateUUID } from "@/lib/utils";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const itemId = searchParams.get("itemId");

  const [item, setItem] = useState<ItemResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", cardNumber: "", expiry: "", cvv: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!itemId) { router.push("/marketplace"); return; }
    marketplaceService.getItemById(itemId)
      .then(data => {
        if (data.status !== "AVAILABLE") {
          setError("This item is no longer available.");
        }
        setItem(data);
      })
      .catch(() => setError("Item not found."))
      .finally(() => setLoading(false));
  }, [itemId]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = "Valid email required";
    if (!form.cardNumber.replace(/\s/g, "").match(/^\d{16}$/)) errs.cardNumber = "Enter 16-digit card number";
    if (!form.expiry.match(/^\d{2}\/\d{2}$/)) errs.expiry = "Format: MM/YY";
    if (!form.cvv.match(/^\d{3,4}$/)) errs.cvv = "3 or 4 digits";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !item) return;
    setProcessing(true);
    try {
      // Step 1: Lock the item
      await marketplaceService.updateItemStatus(item.itemId, "LOCKED", item.sellerId);

      // Step 2: Simulate payment processing (2s)
      await new Promise(res => setTimeout(res, 2000));

      // Step 3: Mark as SOLD
      await marketplaceService.updateItemStatus(item.itemId, "SOLD", item.sellerId);

      // Step 4: Save order to localStorage for order history
      const orders = JSON.parse(localStorage.getItem("orders") || "[]");
      const order = {
        orderId: generateUUID(),
        itemId: item.itemId,
        title: item.title,
        category: item.itemCategory,
        price: item.price,
        imageUrl: item.imageUrl,
        buyerName: form.name,
        buyerEmail: form.email,
        sellerId: item.sellerId,
        purchasedAt: new Date().toISOString(),
        status: "COMPLETED",
      };
      orders.push(order);
      localStorage.setItem("orders", JSON.stringify(orders));

      router.push(`/order-confirmation?orderId=${order.orderId}`);
    } catch {
      // Payment failed — unlock item back to AVAILABLE
      try { await marketplaceService.updateItemStatus(item!.itemId, "AVAILABLE", item!.sellerId); } catch {}
      setError("Payment failed. The item has been returned to available. Please try again.");
      setProcessing(false);
    }
  };

  const formatCard = (val: string) =>
    val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Secure Checkout</h1>

        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />{error}
          </div>
        )}

        <div className="grid md:grid-cols-5 gap-8">
          {/* Payment Form */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <Lock className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">Payment Details</h2>
                <span className="ml-auto text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">SSL Secured</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="John Doe" className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.name ? "border-red-400" : "border-gray-300"}`} />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com" className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.email ? "border-red-400" : "border-gray-300"}`} />
                  {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <div className="relative">
                    <input value={form.cardNumber} onChange={e => setForm(f => ({ ...f, cardNumber: formatCard(e.target.value) }))}
                      placeholder="1234 5678 9012 3456" maxLength={19}
                      className={`w-full px-4 py-3 pl-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${formErrors.cardNumber ? "border-red-400" : "border-gray-300"}`} />
                    <CreditCard className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  </div>
                  {formErrors.cardNumber && <p className="text-red-500 text-xs mt-1">{formErrors.cardNumber}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input value={form.expiry} onChange={e => setForm(f => ({ ...f, expiry: formatExpiry(e.target.value) }))}
                      placeholder="MM/YY" maxLength={5}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${formErrors.expiry ? "border-red-400" : "border-gray-300"}`} />
                    {formErrors.expiry && <p className="text-red-500 text-xs mt-1">{formErrors.expiry}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input value={form.cvv} onChange={e => setForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                      placeholder="123" maxLength={4}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${formErrors.cvv ? "border-red-400" : "border-gray-300"}`} />
                    {formErrors.cvv && <p className="text-red-500 text-xs mt-1">{formErrors.cvv}</p>}
                  </div>
                </div>

                <button type="submit" disabled={processing || !!error}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-3 mt-2">
                  {processing ? (
                    <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /> Processing Payment...</>
                  ) : (
                    <><Shield className="w-5 h-5" /> Pay {item ? formatPrice(item.price) : ""}</>
                  )}
                </button>

                <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" /> Payments are encrypted and secure
                </p>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              {item && (
                <>
                  <div className="flex gap-3 mb-4">
                    <img src={getImageUrl(item.imageUrl)} alt={item.title}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatCategory(item.itemCategory)}</p>
                    </div>
                  </div>
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Item price</span><span>{formatPrice(item.price)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Platform fee</span><span>Free</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 border-t pt-2 mt-2">
                      <span>Total</span><span className="text-blue-600">{formatPrice(item.price)}</span>
                    </div>
                  </div>
                </>
              )}
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-700 font-medium">✓ Buyer protection included</p>
                <p className="text-xs text-green-600 mt-1">Item locked during payment. Auto-released if payment fails.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
