"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import { Heart, Star } from "lucide-react";


import product1 from '../../../images/products/product1.jpg';
import product2 from '../../../images/products/product2.png';
import product3 from '../../../images/products/product3.png';
import product4 from '../../../images/products/product4.png';
import product5 from '../../../images/products/product5.jpg';
import product6 from '../../../images/products/product6.png';
import product7 from '../../../images/products/product7.jpg';
import product8 from '../../../images/products/product8.jpg';
import product9 from '../../../images/products/product9.jpg';
import product10 from '../../../images/products/product10.png';
import product11 from '../../../images/products/product11.png';
import product12 from '../../../images/products/product12.jpg';
import product13 from '../../../images/products/product13.png';
import product14 from '../../../images/products/product14.jpg';
import product15 from '../../../images/products/product15.jpg';

const demoProducts = [
  { id: "demo-0", name: 'Car Decorator Plushie', price: 12.99, new_price: 12.99, image: product1, description: 'Cute car decorator plushie.', category: 'Plushies' },
  { id: "demo-1", name: 'Lafufu', price: 9.99, new_price: 9.99, image: product2, description: 'Adorable lafufu plush.', category: 'Plushies' },
  { id: "demo-2", name: 'baby hammock', price: 24.99, new_price: 24.99, image: product3, description: 'Comfy hammock for babies.', category: 'Baby Items' },
  { id: "demo-3", name: 'Crochet Bee', price: 14.99, new_price: 14.99, image: product4, description: 'Handmade crochet bee.', category: 'Crochet' },
  { id: "demo-4", name: 'Diy multi_colored ribbons', price: 7.99, new_price: 7.99, image: product5, description: 'Colorful DIY ribbons.', category: 'Crafts' },
  { id: "demo-5", name: 'Cat hat', price: 8.99, new_price: 8.99, image: product6, description: 'Hat for your cat.', category: 'Pet Accessories' },
  { id: "demo-6", name: 'clay mirror', price: 19.99, new_price: 19.99, image: product7, description: 'Decorative clay mirror.', category: 'Home Decor' },
  { id: "demo-7", name: 'Crochet sushis', price: 11.99, new_price: 11.99, image: product8, description: 'Cute crochet sushi set.', category: 'Crochet' },
  { id: "demo-8", name: 'clay flower vase', price: 15.99, new_price: 15.99, image: product9, description: 'Handmade clay vase.', category: 'Home Decor' },
  { id: "demo-9", name: 'cherry rug', price: 13.99, new_price: 13.99, image: product10, description: 'Cherry-themed rug.', category: 'Home Decor' },
  { id: "demo-10", name: 'stitch', price: 10.99, new_price: 10.99, image: product11, description: 'Stitch plushie.', category: 'Plushies' },
  { id: "demo-11", name: 'sage green rug', price: 16.99, new_price: 16.99, image: product12, description: 'Sage green rug.', category: 'Home Decor' },
  { id: "demo-12", name: 'Dreamy lounge sofa', price: 29.99, new_price: 29.99, image: product13, description: 'Dreamy mini sofa.', category: 'Furniture' },
  { id: "demo-13", name: 'Crochet Chick Cup', price: 6.99, new_price: 6.99, image: product14, description: 'Chick cup cozy.', category: 'Crochet' },
  { id: "demo-14", name: 'cute cat giveaway', price: 5.99, new_price: 5.99, image: product15, description: 'Cute cat giveaway item.', category: 'Giveaways' },
];


function getAverageRating(reviews: { rating: number }[] = []) {
  if (!reviews.length) return 0;
  return (
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  ).toFixed(1);
}

export default function ShopPage() {
  // State for products and wishlist
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`http://localhost:4000/allproducts`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped = data.map((p: any) => ({
            id: String(p.id),
            name: p.name,
            image: p.image,
            price: p.new_price,
            new_price: p.new_price,
            category: p.category,
            reviews: p.reviews || [],
          }));
          // Merge backend products with demo products
          setProducts([...mapped, ...demoProducts]);
        } else {
          // Fallback to demos if unexpected shape
          setProducts(demoProducts);
        }
      } catch (e) {
        setError('Failed to load products. Showing demo items.');
        setProducts(demoProducts);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  function toggleWishlist(product: any) {
    const isInWishlist = wishlist.some(item => item.id === product.id);
    if (isInWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.new_price || product.price,
      });
    }
  }

  return (
    <main className="min-h-screen py-10 bg-pink-50">
      <div className="max-w-6xl px-6 mx-auto">
        <h1 className="mb-10 text-4xl font-extrabold text-center text-shop-dark-pink">
          All Products
        </h1>

        {loading ? (
          <div className="text-center text-pink-400">Loading products...</div>
        ) : (
          <>
            {error && (
              <div className="mb-4 text-sm text-center text-orange-500">{error}</div>
            )}
            {products.length === 0 ? (
              <div className="text-center text-pink-400">No products found.</div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => {
                  const id = product.id || product._id;
                  const inWishlist = wishlist.some(item => item.id === id);
                  const avgRating = getAverageRating(product.reviews);
                  const productPrice = product.new_price || product.price;

                  return (
                    <div key={id} className="relative flex flex-col items-center p-4 transition bg-white border border-pink-100 shadow rounded-xl hover:shadow-lg">
                      {/* Wishlist button */}
                      <button
                        className="absolute z-10 top-3 right-3"
                        onClick={() => toggleWishlist(product)}
                        aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        {inWishlist ? (
                          <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
                        ) : (
                          <Heart className="w-6 h-6 text-pink-300" />
                        )}
                      </button>
                      
                      {/* Product image and name link */}
                      <Link href={`/shop/${id}`} className="flex flex-col items-center w-full group">
                        <Image 
                          src={product.image} 
                          alt={product.name} 
                          width={200} 
                          height={200} 
                          className="object-cover w-full mb-4 transition rounded group-hover:scale-105" 
                        />
                        <div className="mb-1 text-lg font-semibold text-center text-shop-dark-pink">
                          {product.name}
                        </div>
                      </Link>
                      
                      {/* Category badge */}
                      {product.category && (
                        <div className="px-2 py-1 mb-2 text-xs text-gray-600 capitalize bg-gray-100 rounded-full">
                          {product.category}
                        </div>
                      )}
                      
                      {/* Artisan link if available */}
                      {product.sellerId && (
                        <div className="mb-1 text-xs text-gray-500">
                          By <Link href={`/artisan/${product.sellerId}`} className="underline hover:text-shop-dark-pink">Artisan</Link>
                        </div>
                      )}
                      
                      {/* Average rating */}
                      <div className="flex items-center gap-1 mb-1">
                        {[1,2,3,4,5].map((n) => (
                          <Star key={n} className={n <= Math.round(Number(avgRating)) ? "w-4 h-4 text-yellow-400 fill-yellow-400" : "w-4 h-4 text-gray-300"} />
                        ))}
                        {Number(avgRating) > 0 && <span className="ml-1 text-xs text-gray-500">{avgRating}</span>}
                      </div>
                      
                      {/* Price and Add to Cart */}
                      <div className="mb-2 font-bold text-pink-700">
                        ${productPrice?.toFixed(2)}
                      </div>
                      <button
                        className="px-4 py-2 font-semibold transition bg-pink-200 rounded text-shop-dark-pink hover:bg-pink-300"
                        onClick={() => addToCart({
                          id,
                          name: product.name,
                          image: product.image,
                          price: productPrice,
                        })}
                      >
                        Add to Cart
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}