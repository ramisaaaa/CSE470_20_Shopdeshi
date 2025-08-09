"use client";
import React from "react";
import Image from "next/image";
import { useCart } from "@/components/CartContext";
import { useSearchParams } from "next/navigation";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const params = useSearchParams();
  const success = params.get("success");
  const canceled = params.get("canceled");

  return (
    <main className="min-h-screen bg-pink-50 pb-10">
      <div className="max-w-3xl mx-auto p-8 mt-10">
        <div className="bg-white rounded-xl shadow border border-pink-100 p-8 mb-10">
          <h1 className="text-4xl font-extrabold text-shop-dark-pink mb-4 text-center tracking-tight">Your Cart</h1>
          {success && (
            <div className="mb-6 text-center text-green-600 font-bold bg-green-50 border border-green-200 rounded p-4">
              Payment successful! Thank you for your purchase.
            </div>
          )}
          {canceled && (
            <div className="mb-6 text-center text-red-600 font-bold bg-red-50 border border-red-200 rounded p-4">
              Payment canceled. You have not been charged.
            </div>
          )}
          {cart.length === 0 ? (
            <div className="text-center text-lg text-pink-400">Your cart is empty!</div>
          ) : (
            <div className="">
              <ul className="divide-y divide-pink-100">
                {cart.map((item) => (
                  <li key={item.id} className="flex items-center gap-4 py-4">
                    <Image src={item.image} alt={item.name} width={80} height={80} className="rounded-lg object-cover" />
                    <div className="flex-1">
                      <div className="font-semibold text-shop-dark-pink">{item.name}</div>
                      <div className="text-pink-700 font-bold">${item.price.toFixed(2)}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          className="px-2 py-1 rounded bg-pink-100 text-shop-dark-pink font-bold hover:bg-pink-200"
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        >-</button>
                        <span className="px-2">{item.quantity}</span>
                        <button
                          className="px-2 py-1 rounded bg-pink-100 text-shop-dark-pink font-bold hover:bg-pink-200"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >+</button>
                        <button
                          className="ml-4 px-2 py-1 rounded bg-pink-200 text-pink-800 hover:bg-pink-300"
                          onClick={() => removeFromCart(item.id)}
                        >Remove</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between items-center mt-6">
                <button
                  className="px-4 py-2 rounded bg-pink-100 text-shop-dark-pink font-semibold hover:bg-pink-200"
                  onClick={clearCart}
                >
                  Clear Cart
                </button>
                <div className="text-xl font-bold text-shop-dark-pink">Total: ${total.toFixed(2)}</div>
              </div>
              <form action="/api/checkout" method="POST" className="mt-8 text-center">
                <input type="hidden" name="cart" value={JSON.stringify(cart)} />
                <button
                  type="submit"
                  className="px-6 py-3 rounded bg-shop-dark-pink text-white font-bold hover:bg-pink-300 transition"
                  disabled={cart.length === 0}
                >
                  Checkout with Stripe
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 