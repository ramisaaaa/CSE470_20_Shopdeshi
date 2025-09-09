"use client";
import React from 'react';
import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="min-h-screen py-8 bg-pink-50">
      <div className="max-w-2xl px-4 mx-auto">
        <div className="p-8 text-center bg-white rounded-lg shadow-lg">
          {/* Cancel Icon */}
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>

          <h1 className="mb-4 text-3xl font-bold text-gray-800">
            Payment Cancelled
          </h1>
          
          <p className="mb-6 text-gray-600">
            Your payment was cancelled. No charges were made to your account.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/cart"
              className="px-6 py-3 font-semibold text-white transition-colors rounded-lg bg-shop-dark-pink hover:bg-pink-600"
            >
              Return to Cart
            </Link>
            <Link
              href="/"
              className="px-6 py-3 font-semibold text-gray-800 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}