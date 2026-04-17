import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/common/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Online Marketplace | Buy & Sell with Confidence",
  description:
    "A modern online marketplace platform for buying and selling items securely",
  keywords: ["marketplace", "buy", "sell", "ecommerce"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <Navigation />
        <main className="flex-1">{children}</main>
        <footer className="bg-gray-900 text-gray-300 py-8 mt-12">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p>&copy; Student Online Marketplace. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
