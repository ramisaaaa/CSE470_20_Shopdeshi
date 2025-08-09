"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, Filter, Search } from 'lucide-react';
import { useCart } from '@/components/CartContext';
import { useWishlist } from '@/components/WishlistContext';
import SearchBar from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  reviews?: { rating: number }[];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || '';

  // Load products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(`/products.json?t=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Filter products based on search query and category
  useEffect(() => {
    const filtered = products.filter(product => {
      // If there's a search query, check if product matches it
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower);
        
        // If there's also a category filter, both must match
        if (selectedCategory) {
          return matchesSearch && product.category === selectedCategory;
        }
        // Otherwise just return search matches
        return matchesSearch;
      }
      
      // If only category filter is active
      if (selectedCategory) {
        return product.category === selectedCategory;
      }
      
      // If no filters, return all products
      return true;
    });

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, products]);

  const toggleWishlist = (product: Product) => {
    const isInWishlist = wishlist.some(item => item.id === product.id);
    if (isInWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
      });
    }
  };

  const getAverageRating = (reviews: { rating: number }[] = []) => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const handleSearch = (query: string, category: string) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    
    const newUrl = params.toString() ? `?${params.toString()}` : '/search';
    window.history.pushState({}, '', newUrl);
    
    // The search params will be updated automatically by Next.js
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-pink-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center text-pink-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <div className="p-8 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-shop-dark-pink">
            Search Products
          </h1>
          <SearchBar onSearch={handleSearch} className="max-w-2xl" />
        </div>

        {/* Search Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Search Results
              </h2>
              <Badge variant="secondary">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              </Badge>
            </div>
            
            {(searchQuery || selectedCategory) && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Filters:</span>
                {searchQuery && (
                  <Badge variant="outline">
                    Search: &quot;{searchQuery}&quot;
                  </Badge>
                )}
                {selectedCategory && (
                  <Badge variant="outline">
                    Category: {selectedCategory}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-12 text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-600">
              No products found
            </h3>
            <p className="mb-6 text-gray-500">
              {searchQuery 
                ? `No products match "${searchQuery}"`
                : 'Try adjusting your search terms or browse all products'
              }
            </p>
            <Link href="/shop">
              <Button variant="outline">
                Browse All Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => {
              const id = product.id;
              const inWishlist = wishlist.some(item => item.id === id);
              const avgRating = getAverageRating(product.reviews || []);
              
              return (
                <div key={id} className="relative flex flex-col items-center p-4 bg-white border border-pink-100 shadow rounded-xl">
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
                      width={180} 
                      height={180} 
                      className="object-cover mb-4 transition rounded-lg group-hover:scale-105" 
                    />
                    <div className="mb-1 text-lg font-semibold text-center text-shop-dark-pink">
                      {product.name}
                    </div>
                  </Link>

                  {/* Category badge */}
                  <Badge variant="secondary" className="mb-2 text-xs">
                    {product.category}
                  </Badge>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    {[1,2,3,4,5].map((n) => (
                      <Star 
                        key={n} 
                        className={n <= Math.round(Number(avgRating)) ? "text-yellow-400 fill-yellow-400 w-4 h-4" : "text-gray-300 w-4 h-4"} 
                      />
                    ))}
                    <span className="ml-1 text-sm text-gray-500">
                      ({avgRating})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-3 text-lg font-bold text-pink-700">
                    ${product.price.toFixed(2)}
                  </div>

                  {/* Add to cart button */}
                  <Button 
                    onClick={() => addToCart(product)}
                    className="w-full bg-shop-orange hover:bg-shop-orange/90"
                  >
                    Add to Cart
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 