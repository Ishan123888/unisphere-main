"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CreateItemForm } from "@/components/forms/CreateItemForm";

/**
 * Create Item Page
 */
export default function CreateItemPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/marketplace"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Marketplace
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Item</h1>
          <p className="text-gray-600 mt-2">
            List your item for sale in the marketplace
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <CreateItemForm />
        </div>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Tips for Success</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use a clear, descriptive title</li>
              <li>• Add high-quality product images</li>
              <li>• Write detailed descriptions</li>
              <li>• Set competitive pricing</li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">Fast Verification</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Approved items visible instantly</li>
              <li>• Reach thousands of buyers</li>
              <li>• Secure transactions</li>
              <li>• Buyer protection included</li>
            </ul>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-2">Seller Support</h3>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• 24/7 seller support</li>
              <li>• Free image hosting</li>
              <li>• Easy inventory management</li>
              <li>• Analytics & insights</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
