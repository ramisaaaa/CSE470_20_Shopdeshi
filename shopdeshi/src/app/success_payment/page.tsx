"use client";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessPage() {
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // Verify the payment was successful
      verifyPayment(sessionId);
    } else {
      setError('No payment session found');
      setLoading(false);
    }

    // Auto redirect to buyer page after 8 seconds
    const redirectTimer = setTimeout(() => {
      window.location.href = '/buyer?payment=success';
    }, 8000);

    return () => clearTimeout(redirectTimer);
  }, [sessionId]);

  const verifyPayment = async (sessionId: string) => {
    try {
      console.log('Verifying payment for session:', sessionId);
      
      // You can add a backend endpoint to verify the session if needed
      // For now, we'll just show success and clear cart
      
      // Clear the cart since payment was successful
      localStorage.removeItem('cart');
      
      // Simulate order details (you can fetch real details from backend)
      setOrderDetails({
        sessionId,
        status: 'confirmed',
        message: 'Your payment has been processed successfully!'
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error verifying payment:', error);
      setError('Error verifying payment');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-shop-dark-pink mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Your Payment...</h2>
          <p className="text-gray-600">Please wait while we confirm your order.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Payment Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-4">
            <Link
              href="/cart"
              className="bg-shop-dark-pink text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
            >
              Back to Cart
            </Link>
            <Link
              href="/"
              className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Animation */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-green-600 mb-2">Payment Successful!</h1>
            <p className="text-xl text-gray-600">Thank you for your purchase</p>
          </div>

          {/* Order Details */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Order Confirmation</h2>
            <div className="text-left space-y-2">
              <p><strong>Payment Status:</strong> <span className="text-green-600">Confirmed</span></p>
              <p><strong>Transaction ID:</strong> <span className="font-mono text-sm">{sessionId?.slice(-12)}</span></p>
              <p><strong>Confirmation:</strong> You will receive an email confirmation shortly</p>
              <p><strong>Processing:</strong> Your order is being prepared for shipment</p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-3">What happens next?</h3>
            <div className="text-left space-y-2 text-gray-700">
              <div className="flex items-center">
                <span className="w-6 h-6 bg-shop-dark-pink text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">1</span>
                Order confirmation email sent to your inbox
              </div>
              <div className="flex items-center">
                <span className="w-6 h-6 bg-shop-dark-pink text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">2</span>
                Your items will be carefully packed
              </div>
              <div className="flex items-center">
                <span className="w-6 h-6 bg-shop-dark-pink text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">3</span>
                Shipping notification with tracking details
              </div>
              <div className="flex items-center">
                <span className="w-6 h-6 bg-shop-dark-pink text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">4</span>
                Delivery within 3-7 business days
              </div>
            </div>
          </div>

          {/* Auto-redirect Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-blue-800">
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              You will be automatically redirected to your order history in a few seconds...
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/buyer?payment=success"
              className="bg-shop-dark-pink text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
            >
              View My Orders
            </Link>
            <Link
              href="/"
              className="bg-gray-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              href="/contact"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Need Help?
            </Link>
          </div>

          {/* Customer Support */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Questions about your order? Contact our support team at 
              <a href="mailto:support@shopdeshi.com" className="text-shop-dark-pink font-medium ml-1">
                support@shopdeshi.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}