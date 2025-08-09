"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import { Star, ArrowLeft, Heart } from "lucide-react";

import product1 from '../../../../images/products/product1.jpg';
import product2 from '../../../../images/products/product2.png';
import product3 from '../../../../images/products/product3.png';
import product4 from '../../../../images/products/product4.png';
import product5 from '../../../../images/products/product5.jpg';
import product6 from '../../../../images/products/product6.png';
import product7 from '../../../../images/products/product7.jpg';
import product8 from '../../../../images/products/product8.jpg';
import product9 from '../../../../images/products/product9.jpg';
import product10 from '../../../../images/products/product10.png';
import product11 from '../../../../images/products/product11.png';
import product12 from '../../../../images/products/product12.jpg';
import product13 from '../../../../images/products/product13.png';
import product14 from '../../../../images/products/product14.jpg';
import product15 from '../../../../images/products/product15.jpg';

const demoProducts = [
  { id: "demo-0", name: 'Car Decorator Plushie', price: 12.99, new_price: 12.99, image: product1, description: 'Cute car decorator plushie for your car interior. Made with soft, high-quality materials.', category: 'Plushies' },
  { id: "demo-1", name: 'Lafufu', price: 9.99, new_price: 9.99, image: product2, description: 'Adorable lafufu plush that brings joy to any room.', category: 'Plushies' },
  { id: "demo-2", name: 'baby hammock', price: 24.99, new_price: 24.99, image: product3, description: 'Comfy hammock for babies. Safe and secure design.', category: 'Baby Items' },
  { id: "demo-3", name: 'Crochet Bee', price: 14.99, new_price: 14.99, image: product4, description: 'Handmade crochet bee with attention to detail.', category: 'Crochet' },
  { id: "demo-4", name: 'Diy multi_colored ribbons', price: 7.99, new_price: 7.99, image: product5, description: 'Colorful DIY ribbons for craft projects.', category: 'Crafts' },
  { id: "demo-5", name: 'Cat hat', price: 8.99, new_price: 8.99, image: product6, description: 'Adorable hat designed for your feline friend.', category: 'Pet Accessories' },
  { id: "demo-6", name: 'clay mirror', price: 19.99, new_price: 19.99, image: product7, description: 'Decorative clay mirror handcrafted with care.', category: 'Home Decor' },
  { id: "demo-7", name: 'Crochet sushis', price: 11.99, new_price: 11.99, image: product8, description: 'Cute crochet sushi set for decoration or play.', category: 'Crochet' },
  { id: "demo-8", name: 'clay flower vase', price: 15.99, new_price: 15.99, image: product9, description: 'Handmade clay flower vase perfect for home decoration.', category: 'Home Decor' },
  { id: "demo-9", name: 'cherry rug', price: 13.99, new_price: 13.99, image: product10, description: 'Cherry-themed rug to brighten up any space.', category: 'Home Decor' },
  { id: "demo-10", name: 'stitch', price: 10.99, new_price: 10.99, image: product11, description: 'best plushie from your favorite movie.', category: 'Plushies' },
  { id: "demo-11", name: 'sage green rug', price: 16.99, new_price: 16.99, image: product12, description: 'Beautiful sage green rug for modern homes.', category: 'Home Decor' },
  { id: "demo-12", name: 'Dreamy lounge sofa', price: 29.99, new_price: 29.99, image: product13, description: 'Miniature dreamy lounge sofa for decoration.', category: 'Furniture' },
  { id: "demo-13", name: 'Crochet Chick Cup', price: 6.99, new_price: 6.99, image: product14, description: 'Cute chick-themed cup cozy made with crochet.', category: 'Crochet' },
  { id: "demo-14", name: 'cute cat giveaway', price: 5.99, new_price: 5.99, image: product15, description: 'Adorable cat-themed giveaway item.', category: 'Giveaways' },
];

function getAverageRating(reviews) {
  if (!reviews.length) return 0;
  return (
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  ).toFixed(1);
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("No product ID provided");
      return;
    }

    console.log("Looking for product with ID:", id);

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        // First check demo products
        const demoProduct = demoProducts.find((p) => p.id === id);
        
        if (demoProduct) {
          console.log("Found demo product:", demoProduct);
          setProduct(demoProduct);
          // Use localStorage for demo products
          const savedReviews = localStorage.getItem(`reviews_${id}`);
          setReviews(savedReviews ? JSON.parse(savedReviews) : []);
          setLoading(false);
          return;
        }

        // If not a demo product, fetch from API
        console.log("Not a demo product, fetching from API...");
        
        const response = await fetch("http://localhost:4000/allproducts");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("API response:", data);
        
        if (!Array.isArray(data)) {
          throw new Error("API did not return an array");
        }

        // More comprehensive ID matching
        const apiProduct = data.find((p) => {
          const productId = p._id || p.id;
          console.log(`Comparing "${productId}" with "${id}"`);
          return productId === id || String(productId) === String(id);
        });

        if (apiProduct) {
          console.log("Found API product:", apiProduct);
          const formattedProduct = {
            ...apiProduct,
            id: apiProduct._id || apiProduct.id,
            price: apiProduct.new_price || apiProduct.price,
          };
          
          setProduct(formattedProduct);
          setReviews(apiProduct.reviews || []);
        } else {
          console.log("Product not found in API data");
          console.log("Available product IDs:", data.map(p => p._id || p.id));
          setError("Product not found");
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError(err.message || "Failed to fetch product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (!rating || !comment.trim() || !reviewerName.trim()) {
      alert("Please fill in all fields and select a rating.");
      return;
    }

    setSubmittingReview(true);

    const newReview = {
      user: reviewerName,
      rating,
      comment,
      date: new Date().toISOString(),
    };

    // Handle demo products with localStorage
    if (product?.id?.startsWith('demo-')) {
      const updatedReviews = [newReview, ...reviews];
      setReviews(updatedReviews);
      localStorage.setItem(`reviews_${id}`, JSON.stringify(updatedReviews));
      
      // Reset form
      setRating(0);
      setComment("");
      setReviewerName("");
      setSubmittingReview(false);
      return;
    }

    // Handle database products
    try {
      const response = await fetch("http://localhost:4000/addreview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          user: reviewerName,
          rating: rating,
          comment: comment,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Add the new review to the current reviews list
        const updatedReviews = [newReview, ...reviews];
        setReviews(updatedReviews);
        
        // Reset form
        setRating(0);
        setComment("");
        setReviewerName("");
        alert("Review submitted successfully!");
      } else {
        alert("Failed to submit review: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  }

  const toggleWishlist = () => {
    if (!product) return;
    
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
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-pink-400">Loading product...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <main className="min-h-screen bg-pink-50 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <Link href="/shop" className="inline-flex items-center gap-2 text-shop-dark-pink hover:underline mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>
          
          <div className="text-center bg-white rounded-xl shadow-lg border border-pink-100 p-8">
            <div className="text-pink-400 mb-4 text-lg">
              {error || "Product not found"}
            </div>
            <div className="text-gray-600 mb-4">
              Product ID: <code className="bg-gray-100 px-2 py-1 rounded">{id}</code>
            </div>
            <Link href="/shop" className="inline-block px-6 py-3 bg-shop-dark-pink text-white font-semibold rounded-lg hover:bg-pink-600 transition">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const avgRating = getAverageRating(reviews);
  const isInWishlist = wishlist.some(item => item.id === product.id);
  const productPrice = product.new_price || product.price;

  return (
    <main className="min-h-screen bg-pink-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back to Shop */}
        <Link href="/shop" className="inline-flex items-center gap-2 text-shop-dark-pink hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Shop
        </Link>



        <div className="bg-white rounded-xl shadow-lg border border-pink-100 p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Product Image */}
            <div className="relative">
              <Image 
                src={product.image} 
                alt={product.name} 
                width={300} 
                height={300} 
                className="rounded-lg object-cover" 
              />
              
              {/* Wishlist Button */}
              <button
                onClick={toggleWishlist}
                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg"
                aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                {isInWishlist ? (
                  <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
                ) : (
                  <Heart className="w-6 h-6 text-pink-300" />
                )}
              </button>
            </div>

            {/* Product Details */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-shop-dark-pink mb-4">{product.name}</h1>
              
              {/* Category */}
              {product.category && (
                <div className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm mb-4 capitalize">
                  {product.category}
                </div>
              )}
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                {[1,2,3,4,5].map((n) => (
                  <Star key={n} className={n <= Math.round(Number(avgRating)) ? "w-5 h-5 text-yellow-400 fill-yellow-400" : "w-5 h-5 text-gray-300"} />
                ))}
                <span className="ml-2 text-pink-700 font-bold">{avgRating} / 5</span>
                <span className="ml-2 text-gray-400 text-sm">({reviews.length} reviews)</span>
              </div>
              
              {/* Price */}
              <div className="text-pink-700 font-bold text-2xl mb-4">${productPrice?.toFixed(2)}</div>
              
              {/* Description */}
              <div className="text-gray-700 mb-6 leading-relaxed">{product.description}</div>
              
              {/* Add to Cart Button */}
              <button
                onClick={() => addToCart({
                  id: product.id,
                  name: product.name,
                  image: product.image,
                  price: productPrice,
                })}
                className="px-6 py-3 bg-shop-dark-pink text-white font-semibold rounded-lg hover:bg-pink-600 transition"
              >
                Add to Cart
              </button>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-12 border-t border-pink-100 pt-8">
            <h2 className="text-2xl font-bold text-shop-dark-pink mb-6">Customer Reviews</h2>
            
            {/* Add Review Form */}
            <form onSubmit={handleReviewSubmit} className="mb-8 bg-pink-50 p-6 rounded-xl">
              <h3 className="font-semibold text-shop-dark-pink mb-4">Write a Review</h3>
              
              {/* Name Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                <input
                  type="text"
                  className="w-full border border-pink-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-300"
                  placeholder="Enter your name"
                  value={reviewerName}
                  onChange={e => setReviewerName(e.target.value)}
                  required
                  disabled={submittingReview}
                />
              </div>
              
              {/* Rating */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((n) => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => setRating(n)}
                      className={`p-1 ${n <= rating ? "text-yellow-400" : "text-gray-300"} hover:text-yellow-400 focus:outline-none`}
                      aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
                      disabled={submittingReview}
                    >
                      <Star className={n <= rating ? "w-6 h-6 fill-yellow-400" : "w-6 h-6"} />
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Comment */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                <textarea
                  className="w-full border border-pink-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-pink-300"
                  rows={4}
                  placeholder="Share your thoughts about this product..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  required
                  disabled={submittingReview}
                />
              </div>
              
              <button 
                type="submit" 
                className="px-6 py-2 rounded-lg bg-shop-dark-pink text-white font-semibold hover:bg-pink-600 transition disabled:opacity-50"
                disabled={submittingReview}
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </form>

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <div className="text-center text-pink-400 py-8">
                No reviews yet. Be the first to review this product!
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((r, i) => (
                  <div key={i} className="bg-white border border-pink-100 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-2">
                      {[1,2,3,4,5].map((n) => (
                        <Star key={n} className={n <= r.rating ? "w-4 h-4 text-yellow-400 fill-yellow-400" : "w-4 h-4 text-gray-300"} />
                      ))}
                      <span className="ml-2 text-sm text-gray-500">
                        {new Date(r.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="font-semibold text-shop-dark-pink mb-2">{r.user}</div>
                    <div className="text-gray-700 leading-relaxed">{r.comment}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}