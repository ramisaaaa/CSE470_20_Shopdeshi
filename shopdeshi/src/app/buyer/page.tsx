"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

// For demo: fetch all products
async function fetchProducts() {
  const res = await fetch("/products.json");
  if (!res.ok) return [];
  return res.json();
}

export default function BuyerPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("wishlist") || "[]");
    }
    return [];
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  function toggleWishlist(id: string) {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  }

  return (
    <main className="min-h-screen bg-pink-50 pb-10">
      <div className="max-w-4xl mx-auto p-8 mt-10">
        <div className="bg-white rounded-xl shadow border border-pink-100 p-8 mb-10">
          <h1 className="text-4xl font-extrabold text-shop-dark-pink mb-4 text-center tracking-tight">Buyer Dashboard</h1>
          <div className="mb-4 text-lg text-pink-700 text-center font-semibold">
            Welcome, Buyer! Browse your wishlist and order history below.
          </div>
        </div>
        <div className="flex items-center mb-8">
          <div className="flex-grow border-t border-pink-200"></div>
          <span className="mx-4 text-pink-400 font-bold text-lg">Your Wishlist</span>
          <div className="flex-grow border-t border-pink-200"></div>
        </div>
        <div className="mb-12">
          {loading ? (
            <div className="text-center text-pink-400">Loading products...</div>
          ) : wishlist.length === 0 ? (
            <div className="text-center text-pink-400">No products in your wishlist yet.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {products.filter((p) => wishlist.includes(p.id)).map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow border border-pink-100 flex flex-col items-center p-4 hover:shadow-lg transition">
                  <Image src={product.image} alt={product.name} width={120} height={120} className="rounded-lg object-cover mb-2" />
                  <div className="text-lg font-semibold text-shop-dark-pink mb-1 text-center">{product.name}</div>
                  <div className="text-pink-700 font-bold mb-1">${product.price.toFixed(2)}</div>
                  <div className="text-sm text-gray-500 mb-2 text-center">{product.description}</div>
                  <button
                    className="px-4 py-1 rounded bg-pink-200 text-shop-dark-pink font-semibold hover:bg-pink-300 transition"
                    onClick={() => toggleWishlist(product.id)}
                  >
                    Remove from Wishlist
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center mb-8">
          <div className="flex-grow border-t border-pink-200"></div>
          <span className="mx-4 text-pink-400 font-bold text-lg">Order History</span>
          <div className="flex-grow border-t border-pink-200"></div>
        </div>
        <div>
          <div className="text-center text-pink-400">(Order history coming soon!)</div>
        </div>
      </div>
    </main>
  );
} 