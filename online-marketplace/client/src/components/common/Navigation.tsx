"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, HomeIcon, Plus, BarChart3 } from "lucide-react";

/**
 * Navigation Component
 * Top navigation bar with links to main sections
 */
export const Navigation: React.FC = () => {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <ShoppingBag className="w-6 h-6 text-blue-600" />
            <span className="hidden sm:inline text-gray-900">
              Marketplace
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/"
              className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-colors text-sm sm:text-base"
              title="Home"
            >
              <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Home</span>
            </Link>

            <Link
              href="/marketplace"
              className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-colors text-sm sm:text-base"
              title="Browse Marketplace"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Marketplace</span>
            </Link>

            <Link
              href="/create-item"
              className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-colors text-sm sm:text-base font-medium"
              title="Sell Item"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Sell</span>
            </Link>

            <Link
              href="/seller-dashboard"
              className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-colors text-sm sm:text-base"
              title="Seller Dashboard"
            >
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
