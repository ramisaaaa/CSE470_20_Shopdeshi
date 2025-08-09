"use client";
import React, { useState } from "react";
import SideBar from "@/components/SideBar";
import Footer from "@/components/Footer";
import { AlignLeft } from "lucide-react";
import { CartProvider } from "@/components/CartContext";
import { WishlistProvider } from "@/components/WishlistContext";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <CartProvider>
      <WishlistProvider>
        <div className="hidden md:block">
          {sidebarOpen ? (
            <SideBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          ) : (
            <button
              className="fixed top-6 left-4 z-50 p-2 rounded bg-shop-light-blue shadow hover:bg-shop-orange transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <AlignLeft className="w-6 h-6 text-shop-dark-pink" />
            </button>
          )}
        </div>
        <div className={sidebarOpen ? "md:ml-64" : ""}>
          {children}
          <Footer />
        </div>
      </WishlistProvider>
    </CartProvider>
  );
} 