"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
//import SuccessPage from "../success_payment/page";
interface CartItem {
  id: number;
  name: string;
  image: string;
  new_price: number;
  old_price: number;
  quantity: number;
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    email: "",
    name: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: ""
  });

  useEffect(() => {
    loadCartFromStorage();
    
    // Listen for cart updates from other pages
    const handleCartUpdate = () => {
      loadCartFromStorage();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const loadCartFromStorage = () => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        console.log('Raw cart data from localStorage:', parsedCart);
        
        // Handle different possible price field names and ensure proper data
        const validatedCart = parsedCart.map((item: any) => {
          const newPrice = item.new_price || item.price || item.newPrice || 0;
          const oldPrice = item.old_price || item.oldPrice || item.originalPrice || item.price || 0;
          
          console.log(`Item ${item.name}: new_price=${newPrice}, old_price=${oldPrice}`);
          
          return {
            ...item,
            new_price: Number(newPrice),
            old_price: Number(oldPrice),
            quantity: Number(item.quantity) || 1
          };
        });
        
        console.log('Validated cart data:', validatedCart);
        setCartItems(validatedCart);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      setCartItems([]);
    }
  };

  const saveCartToStorage = (items: CartItem[]) => {
    try {
      localStorage.setItem("cart", JSON.stringify(items));
      console.log('Cart saved to localStorage:', items);
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }

    const updatedItems = cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    saveCartToStorage(updatedItems);
  };

  const removeFromCart = (id: number) => {
    const updatedItems = cartItems.filter(item => item.id !== id);
    setCartItems(updatedItems);
    saveCartToStorage(updatedItems);
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
    console.log('Cart cleared');
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = Number(item.new_price) || 0;
      const quantity = Number(item.quantity) || 1;
      return total + (price * quantity);
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  };

  const handleCheckout = async () => {
  if (!customerInfo.email || !customerInfo.name) {
    alert("Please fill in required fields (email and name)");
    return;
  }

  if (cartItems.length === 0) {
    alert("Your cart is empty");
    return;
  }

  setLoading(true);

  try {
    console.log('Sending checkout request...', cartItems);
    
    const checkoutData = {
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: Number(item.new_price),
        quantity: Number(item.quantity),
        // FIX: Extract simple string from Next.js image object
        image: typeof item.image === 'string' ? item.image : 
               (item.image?.src || item.image || '/placeholder.jpg')
      })),
      customerInfo,
      // ✅ FIXED: Frontend variables only
      successUrl: `${window.location.origin}/success`,
      cancelUrl: `${window.location.origin}/cart`
    };
    
    console.log('Formatted checkout data:', checkoutData);
    
    const response = await axios.post("http://localhost:4000/api/create-checkout-session", checkoutData, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Checkout response:', response.data);

    if (response.data.success && response.data.url) {
      localStorage.removeItem("cart");
      window.location.href = response.data.url;
    } else {
      throw new Error(response.data.message || "Failed to create checkout session");
    }
  } catch (error: any) {
    console.error("Checkout error:", error);
    
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      alert("Cannot connect to server. Please check if the backend is running on port 4000.");
    } else if (error.response?.data?.message) {
      alert(`Checkout failed: ${error.response.data.message}`);
    } else {
      alert(`Checkout failed: ${error.message}`);
    }
  } finally {
    setLoading(false);
  }
};

  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerInfo({
      ...customerInfo,
      [e.target.name]: e.target.value
    });
  };

  // Debug function - remove in production
  const debugCart = () => {
    console.log('=== CART DEBUG INFO ===');
    console.log('Current cart items:', cartItems);
    console.log('Raw localStorage cart:', localStorage.getItem('cart'));
    console.log('Total price:', getTotalPrice());
    console.log('Total items:', getTotalItems());
    
    cartItems.forEach((item, index) => {
      console.log(`Item ${index + 1}:`, {
        name: item.name,
        new_price: item.new_price,
        old_price: item.old_price,
        quantity: item.quantity,
        total: (item.new_price * item.quantity)
      });
    });
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-pink-50">
        <div className="text-center">
          <div className="mb-4 text-6xl">🛒</div>
          <h2 className="mb-4 text-2xl font-bold text-gray-800">Your cart is empty</h2>
          <p className="mb-8 text-gray-600">Add some products to get started!</p>
          <Link
            href="/"
            className="px-6 py-3 font-semibold text-white transition-colors rounded-lg bg-shop-dark-pink hover:bg-pink-600"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-pink-50">
      <div className="max-w-6xl px-4 mx-auto">
        <div className="p-6 mb-6 bg-white rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-shop-dark-pink">Shopping Cart</h1>
            
            {/* Debug button - remove in production */}
            <button 
              onClick={debugCart}
              className="px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
            >
              Debug Cart
            </button>
          </div>
          
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Cart Items */}
            <div className="flex-1">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border border-pink-100 rounded-lg">
                    <div className="relative w-20 h-20">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="object-cover w-full h-full rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-image.jpg';
                        }}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-bold text-shop-dark-pink">
                          ${Number(item.new_price).toFixed(2)}
                        </span>
                        {Number(item.old_price) > Number(item.new_price) && Number(item.old_price) > 0 && (
                          <span className="text-sm text-gray-500 line-through">
                            ${Number(item.old_price).toFixed(2)}
                          </span>
                        )}
                        {Number(item.new_price) === 0 && (
                          <span className="text-sm text-red-500">(Price not loaded)</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="flex items-center justify-center w-8 h-8 transition-colors bg-pink-100 rounded text-shop-dark-pink hover:bg-pink-200"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="w-12 font-semibold text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex items-center justify-center w-8 h-8 transition-colors bg-pink-100 rounded text-shop-dark-pink hover:bg-pink-200"
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-shop-dark-pink">
                        ${(Number(item.new_price) * Number(item.quantity)).toFixed(2)}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-sm text-red-500 transition-colors hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear your cart?')) {
                      clearCart();
                    }
                  }}
                  className="font-semibold text-red-500 transition-colors hover:text-red-700"
                >
                  Clear Cart
                </button>
                <Link
                  href="/"
                  className="font-semibold transition-colors text-shop-dark-pink hover:text-pink-600"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
            
            {/* Order Summary & Checkout */}
            <div className="lg:w-96">
              <div className="p-6 rounded-lg bg-pink-50">
                <h2 className="mb-4 text-xl font-bold text-shop-dark-pink">Order Summary</h2>
                
                <div className="mb-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Items ({getTotalItems()})</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-shop-dark-pink">${getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>

                {/* Warning for zero prices */}
                {cartItems.some(item => Number(item.new_price) === 0) && (
                  <div className="p-3 mb-4 text-sm text-red-600 rounded bg-red-50">
                    ⚠️ Some items have no price. Please refresh the page.
                  </div>
                )}
                
                {!showCheckout ? (
                  <button
                    onClick={() => setShowCheckout(true)}
                    disabled={getTotalPrice() === 0}
                    className="w-full py-3 font-semibold text-white transition-colors rounded-lg bg-shop-dark-pink hover:bg-pink-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {getTotalPrice() === 0 ? 'Cannot Checkout' : 'Proceed to Checkout'}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800">Customer Information</h3>
                    
                    <div className="space-y-3">
                      <input
                        type="email"
                        name="email"
                        placeholder="Email*"
                        value={customerInfo.email}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                        required
                      />
                      
                      <input
                        type="text"
                        name="name"
                        placeholder="Full Name*"
                        value={customerInfo.name}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                        required
                      />
                      
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone"
                        value={customerInfo.phone}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                      />
                      
                      <input
                        type="text"
                        name="address"
                        placeholder="Address"
                        value={customerInfo.address}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                      />
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="city"
                          placeholder="City"
                          value={customerInfo.city}
                          onChange={handleInputChange}
                          className="flex-1 p-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                        />
                        <input
                          type="text"
                          name="postalCode"
                          placeholder="ZIP"
                          value={customerInfo.postalCode}
                          onChange={handleInputChange}
                          className="w-24 p-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                        />
                      </div>
                      
                      <input
                        type="text"
                        name="country"
                        placeholder="Country"
                        value={customerInfo.country}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowCheckout(false)}
                        className="flex-1 py-3 font-semibold text-gray-800 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleCheckout}
                        disabled={loading || getTotalPrice() === 0}
                        className="flex-1 py-3 font-semibold text-white transition-colors rounded-lg bg-shop-dark-pink hover:bg-pink-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {loading ? "Processing..." : "Pay Now"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}