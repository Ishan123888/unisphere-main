'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MarketplacePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the dedicated marketplace app running on port 3001
    window.location.href = 'http://localhost:3001';
  }, []);

  return (
    <div className="min-h-screen bg-[#05050f] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-rose-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 animate-pulse">
          🛒
        </div>
        <p className="text-white font-bold text-lg">Opening Marketplace...</p>
        <p className="text-slate-400 text-sm mt-2">
          Not redirected?{' '}
          <a href="http://localhost:3001" className="text-orange-400 underline">
            Click here
          </a>
        </p>
      </div>
    </div>
  );
}
