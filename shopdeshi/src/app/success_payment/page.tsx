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
    console.log('=== SUCCESS PAGE LOADED ===');
    console.log('URL:', window.location.href);
    console.log('Search params:', searchParams.toString());
    console.log('Session ID from URL:', sessionId);
    
    // Try multiple ways to get the session ID
    let extractedSessionId = sessionId;
    
    if (!extractedSessionId) {
      // Try to extract from URL hash or other parameters
      const urlParams = new URLSearchParams(window.location.search);
      extractedSessionId = urlParams.get('session_id') || urlParams.get('sessionId');
    }
    
    if (!extractedSessionId) {
      // Try to extract from the URL path
      const urlPath = window.location.pathname;
      const sessionMatch = urlPath.match(/session_id=([^&]+)/);
      if (sessionMatch) {
        extractedSessionId = sessionMatch[1];
      }
    }
    
    console.log('Final extracted session ID:', extractedSessionId);
    
    if (extractedSessionId) {
      console.log('✅ Session ID found, verifying payment...');
      // Verify the payment was successful
      verifyPayment(extractedSessionId);
    } else {
      console.log('❌ No session ID found in URL');
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
      console.log('=== FRONTEND: Verifying payment for session:', sessionId);
      
      // Call backend to verify payment and create order
      console.log('=== FRONTEND: Calling backend verification endpoint...');
      const response = await fetch('http://localhost:4000/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      console.log('=== FRONTEND: Response status:', response.status);
      const result = await response.json();
      console.log('=== FRONTEND: Response data:', result);
      
      if (result.success) {
        console.log('Payment verified successfully:', result);
        
        // Clear the cart since payment was successful
        localStorage.removeItem('cart');
        
        // Set order details from backend response
        setOrderDetails({
          sessionId,
          status: 'confirmed',
          message: 'Your payment has been processed successfully!',
          orderId: result.order?._id,
          total: result.order?.totalPrice
        });
      } else {
        console.error('Payment verification failed:', result.message);
        setError(result.message || 'Payment verification failed');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error verifying payment:', error);
      setError('Error verifying payment. Please contact support if the issue persists.');
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