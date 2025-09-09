'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: string;
}

const CategoryPage = () => {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(`http://localhost:4000/allproducts`);
        if (response.ok) {
          const data = await response.json();
          const mapped = Array.isArray(data) ? data.map((p: any) => ({
            id: String(p.id),
            name: p.name,
            image: p.image,
            price: p.new_price,
            category: p.category,
            reviews: p.reviews || [],
          })) : [];
          setProducts(mapped);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (category && products.length > 0) {
      // More flexible category matching
      const filtered = products.filter(p => {
        const productCategory = p.category?.toLowerCase().trim();
        const searchCategory = category.toLowerCase().trim();
        
        // Debug: Log category comparison
        console.log(`Comparing: "${productCategory}" with "${searchCategory}"`);
        
        return productCategory === searchCategory;
      });
      
      console.log(`Filtered ${filtered.length} products for category "${category}"`);
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [category, products]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-pink-500 rounded-full animate-spin"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">
          <p>Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 mt-4 text-white bg-pink-500 rounded hover:bg-pink-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      {/* Debug info - remove this in production */}
      <div className="p-4 mb-4 text-sm bg-gray-100 rounded">
        <p><strong>Debug Info:</strong></p>
        <p>Category from URL: {category || 'None'}</p>
        <p>Total products: {products.length}</p>
        <p>Filtered products: {filteredProducts.length}</p>
        <p>Available categories: {[...new Set(products.map(p => p.category))].join(', ')}</p>
      </div>

      {/* Category title */}
      {category && (
        <h1 className="mb-8 text-2xl font-bold text-center capitalize">
          {category} Products
        </h1>
      )}

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map(product => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="block p-4 transition border border-gray-200 rounded-lg group hover:shadow-lg"
            >
              {product.image ? (
                <div className="relative w-[180px] h-[180px] mx-auto mb-4">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition rounded-lg group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                </div>
              ) : (
                <div className="w-[180px] h-[180px] flex items-center justify-center bg-gray-100 text-gray-400 text-sm rounded-lg mx-auto mb-4">
                  No Image
                </div>
              )}
              <h3 className="text-lg font-medium text-center">{product.name}</h3>
              <p className="font-semibold text-center text-orange-600">${product.price}</p>
              {/* Debug: Show product ID */}
              <p className="mt-1 text-xs text-center text-gray-400">ID: {product.id}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-20 text-center text-pink-500">
          <p>No products found{category ? ` for category "${category}"` : ''}.</p>
          <Link href="/shop" className="block mt-2 text-pink-600 underline">
            ← Back to Shop
          </Link>
          {/* Debug: Show available categories */}
          {products.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              <p>Available categories:</p>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {[...new Set(products.map(p => p.category))].map(cat => (
                  <Link 
                    key={cat} 
                    href={`/category?category=${encodeURIComponent(cat)}`}
                    className="px-3 py-1 text-pink-600 bg-pink-100 rounded-full hover:bg-pink-200"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;