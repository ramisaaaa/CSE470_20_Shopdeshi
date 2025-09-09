"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  const [artisans, setArtisans] = useState<any[]>([]);
  useEffect(() => {
    fetch("/artisans.json")  

      .then((res) => res.ok ? res.json() : [])
      .then((data) => setArtisans(data));
  }, []);

  return (
    <main className="min-h-screen pb-10 bg-pink-50">
      <div className="max-w-3xl p-8 mx-auto mt-10">
        <div className="p-8 mb-10 bg-white border border-pink-100 shadow rounded-xl">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-center text-shop-dark-pink">About Shopdeshi</h1>
          <div className="mb-4 text-lg text-center text-gray-700">
            Shopdeshi is a platform that connects talented artisans with buyers who appreciate handmade, unique, and beautiful crafts. Our mission is to empower local creators and share their stories with the world.
          </div>
        </div>
        <div className="flex items-center mb-8">
          <div className="flex-grow border-t border-pink-200"></div>
          <span className="mx-4 text-lg font-bold text-pink-400">Meet Our Artisans</span>
          <div className="flex-grow border-t border-pink-200"></div>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {artisans.map((artisan) => (
            <div key={artisan.id} className="flex flex-col items-center p-6 transition bg-white border border-pink-100 shadow rounded-xl hover:shadow-lg">
              <Image src={artisan.photo} alt={artisan.name} width={110} height={110} className="object-cover mb-3 border-4 border-pink-200 rounded-full shadow" />
              <div className="mb-1 text-xl font-bold text-center text-shop-dark-pink">{artisan.name}</div>
              <div className="mb-2 text-center text-gray-600 line-clamp-2">{artisan.story}</div>
              <Link href={`/artisan/${artisan.id}`} className="px-5 py-2 mt-2 font-bold text-white transition rounded bg-shop-dark-pink hover:bg-pink-300">Read Story</Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
} 