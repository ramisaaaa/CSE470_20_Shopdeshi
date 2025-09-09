"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, Filter, Search, X } from 'lucide-react';
import { useCart } from '@/components/CartContext';
import { useWishlist } from '@/components/WishlistContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  category: string;
  reviews?: { rating: number }[];
}

// Enhanced SearchBar component for the search page
function SearchBar({ 
  onSearch, 
  initialQuery = "", 
  initialCategory = "",
  className = "" 
}: { 
  onSearch: (query: string, category: string) => void;
  initialQuery?: string;
  initialCategory?: string;
  className?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);

  const categories = ["men", "women", "kid", "accessories", "electronics", "home"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim(), category);
  };

  const clearSearch = () => {
    setQuery("");
    setCategory("");
    onSearch("", "");
  };

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-3 pr-10 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-3 bg-white border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
        
        <Button 
          type="submit" 
          className="px-6 py-3 bg-shop-dark-pink hover:bg-pink-700 whitespace-nowrap"
        >
          <Search className="w-5 h-5 mr-2" />
          Search
        </Button>
        
        {(query || category) && (
          <Button 
            type="button"
            variant="outline"
            onClick={clearSearch}
            className="px-4 py-3"
          >
            Clear
          </Button>
        )}
      </form>
    </div>
  );
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || '';

  // Load products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");
        
        const response = await fetch(`http://localhost:4000/allproducts`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const mapped = Array.isArray(data) ? data.map((p: any) => ({
          id: String(p.id),
          name: p.name || 'Unnamed Product',
          description: p.description || '',
          image: p.image || '/placeholder-image.jpg',
          price: Number(p.new_price) || 0,
          category: p.category || 'uncategorized',
          reviews: p.reviews || [],
        })) : [];
        
        setProducts(mapped);
      } catch (error) {
        console.error('Error loading products:', error);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  // Filter products based on search query and category
  const filterProducts = useCallback(() => {
    if (products.length === 0) {
      setFilteredProducts([]);
      return;
    }

    const filtered = products.filter((product) => {
      const name = (product?.name ?? '').toString().toLowerCase();
      const description = (product?.description ?? '').toString().toLowerCase();
      const category = (product?.category ?? '').toString().toLowerCase();

      let matchesSearch = true;
      let matchesCategory = true;

      // Apply search query filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        matchesSearch = name.includes(q) || description.includes(q) || category.includes(q);
      }

      // Apply category filter
      if (selectedCategory) {
        matchesCategory = category === selectedCategory.toLowerCase();
      }

      return matchesSearch && matchesCategory;
    });

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory]);

  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  const handleSearch = useCallback((query: string, category: string) => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (category) params.set('category', category);
    
    const newUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(newUrl);
  }, [router]);

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
    const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-pink-50">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-4 border-4 border-pink-200 rounded-full border-t-pink-600 animate-spin"></div>
              <div className="text-pink-400">Loading products...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 bg-pink-50">
        <div className="mx-auto max-w-7xl">
          <div className="py-12 text-center">
            <div className="mb-4 text-red-500">{error}</div>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
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
          <SearchBar 
            onSearch={handleSearch} 
            initialQuery={searchQuery}
            initialCategory={selectedCategory}
            className="max-w-4xl" 
          />
        </div>

        {/* Search Results Header */}
        <div className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {searchQuery || selectedCategory ? 'Search Results' : 'All Products'}
              </h2>
              <Badge variant="secondary">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              </Badge>
            </div>
            
            {(searchQuery || selectedCategory) && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {searchQuery && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    Search: "{searchQuery}"
                    <button 
                      onClick={() => handleSearch("", selectedCategory)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {selectedCategory && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    Category: {selectedCategory}
                    <button 
                      onClick={() => handleSearch(searchQuery, "")}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
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
            <p className="max-w-md mx-auto mb-6 text-gray-500">
              {searchQuery 
                ? `No products match "${searchQuery}"${selectedCategory ? ` in ${selectedCategory}` : ''}`
                : selectedCategory 
                  ? `No products found in ${selectedCategory} category`
                  : 'No products available at the moment'
              }
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              {(searchQuery || selectedCategory) && (
                <Button 
                  onClick={() => handleSearch("", "")}
                  variant="outline"
                >
                  Clear All Filters
                </Button>
              )}
              <Link href="/shop">
                <Button variant="default">
                  Browse All Products
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredProducts.map((product) => {
              const id = product.id;
              const inWishlist = wishlist.some(item => item.id === id);
              const avgRating = getAverageRating(product.reviews || []);
              const reviewCount = product.reviews?.length || 0;
              
              return (
                <div key={id} className="relative flex flex-col transition-shadow duration-200 bg-white border border-pink-100 shadow rounded-xl hover:shadow-lg">
                  {/* Wishlist button */}
                  <button
                    className="absolute z-10 top-3 right-3 p-1.5 bg-white/80 rounded-full hover:bg-white transition-colors"
                    onClick={() => toggleWishlist(product)}
                    aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    {inWishlist ? (
                      <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                    ) : (
                      <Heart className="w-5 h-5 text-pink-300" />
                    )}
                  </button>

                  {/* Product image and name link */}
                  <Link href={`/shop/${id}`} className="flex flex-col p-4 group">
                    <div className="relative mb-3 overflow-hidden rounded-lg bg-gray-50">
                      <Image 
                        src={product.image} 
                        alt={product.name} 
                        width={200} 
                        height={200} 
                        className="object-cover w-full h-48 transition-transform duration-200 group-hover:scale-105" 
                      />
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="mb-2 text-sm font-semibold transition-colors text-shop-dark-pink line-clamp-2 group-hover:text-pink-700">
                        {product.name}
                      </h3>

                      {/* Category badge */}
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {product.category}
                      </Badge>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex">
                          {[1,2,3,4,5].map((n) => (
                            <Star 
                              key={n} 
                              className={`w-3 h-3 ${
                                n <= Math.round(Number(avgRating)) 
                                  ? "text-yellow-400 fill-yellow-400" 
                                  : "text-gray-300"
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          ({reviewCount})
                        </span>
                      </div>

                      {/* Price */}
                      <div className="mb-3 text-lg font-bold text-pink-700">
                        ${product.price.toFixed(2)}
                      </div>
                    </div>
                  </Link>

                  {/* Add to cart button */}
                  <div className="p-4 pt-0">
                    <Button 
                      onClick={() => addToCart(product)}
                      className="w-full text-sm bg-shop-orange hover:bg-shop-orange/90"
                      size="sm"
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Back to top button for long lists */}
        {filteredProducts.length > 12 && (
          <div className="mt-12 text-center">
            <Button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              variant="outline"
            >
              Back to Top
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}