"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { categoriesData } from '@/constants/data';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface SearchBarProps {
  onSearch?: (query: string, category: string) => void;
  className?: string;
}

const API_BASE = 'http://localhost:4000';

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, className = "" }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  // Load products on component mount (from backend)
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE}/allproducts`);
        if (response.ok) {
          const data = await response.json();
          const mapped: Product[] = (Array.isArray(data) ? data : []).map((p: any) => ({
            id: String(p.id ?? p._id),
            name: p.name,
            description: p.description || '',
            price: Number(p.new_price ?? p.price ?? 0),
            image: p.image,
            category: p.category || '',
          }));
          setProducts(mapped);
        } else {
          setProducts([]);
        }
      } catch (error) {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Filter products based on search query and category
  useEffect(() => {
    if (!searchQuery && !selectedCategory) {
      setFilteredProducts([]);
      setShowSearchDropdown(false);
      return;
    }

    const filtered = products.filter(product => {
      // If there's a search query, check if product matches it
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const nameMatch = product.name.toLowerCase().includes(searchLower);
        const descMatch = product.description.toLowerCase().includes(searchLower);
        const categoryMatch = product.category.toLowerCase().includes(searchLower);
        
        const matchesSearch = nameMatch || descMatch || categoryMatch;
        
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
      
      return true;
    });

    setFilteredProducts(filtered);
    setShowSearchDropdown(searchQuery.length > 0 || selectedCategory.length > 0);
  }, [searchQuery, selectedCategory, products]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery, selectedCategory);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setFilteredProducts([]);
    setShowSearchDropdown(false);
  };

  const selectProduct = (product: Product) => {
    setSearchQuery(product.name);
    setShowSearchDropdown(false);
    if (onSearch) {
      onSearch(product.name, selectedCategory);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Search Input */}
        <div className={`relative flex-1 ${className}`} ref={searchRef}>
          <div className="relative">
            <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-4 top-1/2" />
            <Input
              type="text"
              placeholder={isLoading ? "Loading products..." : "Search products..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-shop-dark-pink"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute transform -translate-y-1/2 right-4 top-1/2"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchDropdown && (
            <div className="absolute left-0 right-0 z-50 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg top-full max-h-60">
              {filteredProducts.length > 0 ? (
                filteredProducts.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    onClick={() => selectProduct(product)}
                    className="flex items-center gap-3 p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 last:border-b-0"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="object-cover w-10 h-10 rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">${product.price.toFixed(2)}</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {product.category}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-gray-500">
                  No products found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="relative" ref={categoryRef}>
          <Button
            variant="outline"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="flex items-center h-12 gap-2 px-4"
          >
            <Filter className="w-5 h-5" />
            {selectedCategory ? categoriesData.find(c => c.href === selectedCategory)?.title : 'Category'}
          </Button>

          {showCategoryDropdown && (
            <div className="absolute left-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg top-full min-w-40">
              <div className="p-2">
                <div
                  onClick={() => {
                    setSelectedCategory('');
                    setShowCategoryDropdown(false);
                  }}
                  className="px-3 py-2 text-sm rounded cursor-pointer hover:bg-gray-50"
                >
                  All Categories
                </div>
                {categoriesData.map((category) => (
                  <div
                    key={category.href}
                    onClick={() => {
                      setSelectedCategory(category.href);
                      setShowCategoryDropdown(false);
                    }}
                    className="px-3 py-2 text-sm rounded cursor-pointer hover:bg-gray-50"
                  >
                    {category.title}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search Button */}
        <Button onClick={handleSearch} className="h-12 px-6 text-base bg-shop-orange hover:bg-shop-orange/90">
          Search
        </Button>
      </div>

      {/* Active Filters Display */}
      {(searchQuery || selectedCategory) && (
        <div className="flex items-center gap-2 mt-3">
          <span className="text-sm text-gray-600">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: &quot;{searchQuery}&quot;
              <button onClick={() => setSearchQuery('')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {selectedCategory && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Category: {categoriesData.find(c => c.href === selectedCategory)?.title}
              <button onClick={() => setSelectedCategory('')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;