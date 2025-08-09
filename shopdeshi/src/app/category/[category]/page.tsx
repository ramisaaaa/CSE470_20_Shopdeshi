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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch('http://localhost:4000/allproducts');
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        // Debug: Log the raw data
        console.log('Raw API data:', data);

        const formatted = data.map((product: any) => ({
          id: product._id || product.id,
          name: product.name,
          price: product.new_price || product.price,
          image: product.image,
          category: product.category,
        }));
        
        // Debug: Log product IDs for verification
        console.log('Product IDs from API:', formatted.map(p => p.id));

        // Debug: Log formatted products and categories
        console.log('Formatted products:', formatted);
        console.log('Available categories:', [...new Set(formatted.map((p: Product) => p.category))]);
        console.log('Current category from URL:', category);

        setProducts(formatted);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
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
      <div className="mb-4 p-4 bg-gray-100 rounded text-sm">
        <p><strong>Debug Info:</strong></p>
        <p>Category from URL: {category || 'None'}</p>
        <p>Total products: {products.length}</p>
        <p>Filtered products: {filteredProducts.length}</p>
        <p>Available categories: {[...new Set(products.map(p => p.category))].join(', ')}</p>
      </div>

      {/* Category title */}
      {category && (
        <h1 className="text-2xl font-bold text-center mb-8 capitalize">
          {category} Products
        </h1>
      )}

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map(product => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="group block border border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
            >
              {product.image ? (
                <div className="relative w-[180px] h-[180px] mx-auto mb-4">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover rounded-lg group-hover:scale-105 transition"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                </div>
              ) : (
                <div className="w-[180px] h-[180px] flex items-center justify-center bg-gray-100 text-gray-400 text-sm rounded-lg mx-auto mb-4">
                  No Image
                </div>
              )}
              <h3 className="text-lg font-medium text-center">{product.name}</h3>
              <p className="text-center text-orange-600 font-semibold">${product.price}</p>
              {/* Debug: Show product ID */}
              <p className="text-xs text-gray-400 text-center mt-1">ID: {product.id}</p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center text-pink-500 mt-20">
          <p>No products found{category ? ` for category "${category}"` : ''}.</p>
          <Link href="/shop" className="text-pink-600 underline block mt-2">
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
                    className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full hover:bg-pink-200"
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