"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EditItemForm } from "@/components/forms/EditItemForm";

function EditItemContent() {
  const searchParams = useSearchParams();
  const itemId = searchParams.get("id");

  if (!itemId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">Item ID is missing</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/seller-dashboard"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Item</h1>
          <p className="text-gray-600 mt-1">Update your item details</p>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <EditItemForm itemId={itemId} />
        </div>
      </div>
    </div>
  );
}

export default function EditItemPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" /></div>}>
      <EditItemContent />
    </Suspense>
  );
}
