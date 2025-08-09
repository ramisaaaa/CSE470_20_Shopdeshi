"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";

export default function ArtisanProfilePage() {
  const { id } = useParams();
  const [artisan, setArtisan] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/artisans.json").then((res) => res.ok ? res.json() : []),
      fetch("/products.json").then((res) => res.ok ? res.json() : [])
    ]).then(([artisans, products]) => {
      const found = artisans.find((a: any) => a.id === id);
      setArtisan(found);
      setProducts(products.filter((p: any) => p.sellerId === id));
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="p-8 text-center text-pink-400">Loading...</div>;
  if (!artisan) return <div className="p-8 text-center text-pink-400">Artisan not found.</div>;

  return (
    <main className="min-h-screen bg-pink-50 pb-10">
      <div className="max-w-2xl mx-auto p-8 mt-10">
        <div className="bg-white rounded-xl shadow border border-pink-100 p-8 mb-10 flex flex-col items-center">
          <Image src={artisan.photo} alt={artisan.name} width={120} height={120} className="rounded-full object-cover mb-4 border-4 border-pink-200 shadow" />
          <h1 className="text-3xl font-extrabold text-shop-dark-pink mb-2 text-center tracking-tight">{artisan.name}</h1>
          <div className="text-gray-700 text-center mb-4 text-lg">{artisan.story}</div>
        </div>
        <div className="flex items-center mb-8">
          <div className="flex-grow border-t border-pink-200"></div>
          <span className="mx-4 text-pink-400 font-bold text-lg">Products by {artisan.name}</span>
          <div className="flex-grow border-t border-pink-200"></div>
        </div>
        {products.length === 0 ? (
          <div className="text-center text-pink-400">No products yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow border border-pink-100 flex flex-col items-center p-4 hover:shadow-lg transition">
                <Image src={product.image} alt={product.name} width={100} height={100} className="rounded-lg object-cover mb-2" />
                <div className="text-lg font-semibold text-shop-dark-pink mb-1 text-center">{product.name}</div>
                <div className="text-pink-700 font-bold mb-1">${product.price.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 