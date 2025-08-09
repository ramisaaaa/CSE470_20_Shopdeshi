"use client";
import React from 'react';
import { useWishlist } from '@/components/WishlistContext';
import Container from '@/components/Container';
import Image from 'next/image';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();

  return (
    <Container className="min-h-screen py-12">
      <h1 className="mb-10 text-3xl font-bold text-center text-shop-dark-pink">My Wishlist</h1>
      {wishlist.length === 0 ? (
        <div className="text-lg text-center text-gray-500">Your wishlist is empty.</div>
      ) : (
        <>
          <div className="flex justify-end mb-6">
            <button
              onClick={clearWishlist}
              className="px-4 py-2 font-semibold transition bg-pink-200 rounded text-shop-dark-pink hover:bg-pink-300"
            >
              Clear Wishlist
            </button>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {wishlist.map((item) => (
              <div key={item.id} className="flex flex-col items-center p-6 transition-all border-pink-200 rounded-lg bg-white/80 shadow-pink-100 hover:shadow-lg">
                <Image src={item.image} alt={item.name} width={180} height={180} className="object-cover mb-4 rounded-lg" />
                <div className="mb-2 text-lg font-bold text-center text-shop-dark-pink">{item.name}</div>
                <div className="mb-2 font-semibold text-shop-dark-green">${item.price}</div>
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="px-4 py-1.5 rounded bg-pink-200 text-shop-dark-pink font-semibold hover:bg-pink-300 transition mt-auto"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </Container>
  );
}