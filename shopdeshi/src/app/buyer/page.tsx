"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

// Delivery status stepper component
function DeliveryStepper({ status }: { status: string }) {
  const steps = [
    { name: "Order Placed", value: "confirmed" },
    { name: "Processing", value: "processing" },
    { name: "Shipped", value: "shipped" },
    { name: "Delivered", value: "delivered" }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.value === status);
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto">
      {steps.map((step, index) => (
        <div key={step.value} className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
            index <= currentIndex 
              ? 'bg-green-500 border-green-500 text-white' 
              : 'bg-gray-200 border-gray-300 text-gray-500'
          }`}>
            {index <= currentIndex ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            ) : (
              <span className="text-xs font-bold">{index + 1}</span>
            )}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-8 h-0.5 ${
              index < currentIndex ? 'bg-green-500' : 'bg-gray-300'
            }`}></div>
          )}
        </div>
      ))}
    </div>
  );
}

// Complaint modal component
function ComplaintModal({ 
  orderId, 
  buyerEmail, 
  onClose 
}: { 
  orderId: string; 
  buyerEmail: string; 
  onClose: () => void; 
}) {
  const [message, setMessage] = useState("");
  const [thread, setThread] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingThread, setFetchingThread] = useState(true);

  useEffect(() => {
    fetchComplaintThread();
  }, [orderId]);

  const fetchComplaintThread = async () => {
    try {
      setFetchingThread(true);
      const response = await axios.get(`http://localhost:4000/api/complaints/${orderId}?email=${encodeURIComponent(buyerEmail)}`);
      if (response.data.success) {
        setThread(response.data.complaints || []);
      }
    } catch (error) {
      console.error("Error fetching complaint thread:", error);
    } finally {
      setFetchingThread(false);
    }
  };

  const sendComplaint = async () => {
    if (!message.trim()) {
      alert("Please enter a message");
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:4000/api/complaint", { 
        orderId, 
        message: message.trim(),
        buyerEmail,
        timestamp: new Date().toISOString()
      });
      
      if (response.data.success) {
        const newComplaint = {
          from: "buyer",
          message: message.trim(),
          timestamp: new Date().toISOString(),
          _id: Date.now().toString()
        };
        setThread([...thread, newComplaint]);
        setMessage("");
        alert("Complaint sent successfully!");
      } else {
        alert(response.data.message || "Failed to send complaint");
      }
    } catch (error: any) {
      console.error("Error sending complaint:", error);
      const errorMessage = error.response?.data?.message || "Failed to send complaint. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatComplaintDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Complaint for Order #{orderId.slice(-6)}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Complaint Thread */}
          <div className="mb-6">
            <h3 className="mb-4 text-lg font-semibold">Conversation</h3>
            <div className="p-4 overflow-y-auto border rounded-lg max-h-60 bg-gray-50">
              {fetchingThread ? (
                <div className="py-4 text-center">
                  <div className="w-6 h-6 mx-auto border-b-2 rounded-full animate-spin border-shop-dark-pink"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading conversation...</p>
                </div>
              ) : thread.length === 0 ? (
                <p className="py-4 text-center text-gray-500">No messages yet. Start the conversation below.</p>
              ) : (
                <div className="space-y-3">
                  {thread.map((msg, index) => (
                    <div
                      key={msg._id || index}
                      className={`p-3 rounded-lg ${
                        msg.from === 'buyer' 
                          ? 'bg-blue-100 ml-8' 
                          : 'bg-green-100 mr-8'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-sm font-medium">
                          {msg.from === 'buyer' ? 'You' : 'Support'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatComplaintDate(msg.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* New Message */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Write your message:
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue with this order..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-shop-dark-pink focus:border-transparent"
              rows={4}
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {message.length}/500 characters
              </span>
              <div className="space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={sendComplaint}
                  disabled={loading || !message.trim()}
                  className="px-4 py-2 text-white transition-colors rounded-lg bg-shop-dark-pink hover:bg-pink-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Product review component
function ProductReview({ 
  productId, 
  buyerEmail, 
  productName, 
  onClose 
}: { 
  productId: string; 
  buyerEmail: string; 
  productName: string; 
  onClose: () => void; 
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitReview = async () => {
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }
    
    if (!comment.trim()) {
      alert("Please write a review comment");
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:4000/api/review", { 
        productId: Number(productId), 
        rating, 
        comment: comment.trim(),
        buyerEmail,
        timestamp: new Date().toISOString()
      });
      
      if (response.data.success) {
        setSubmitted(true);
        alert("Review submitted successfully! Thank you for your feedback.");
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        alert(response.data.message || "Failed to submit review");
      }
    } catch (error: any) {
      console.error("Error submitting review:", error);
      const errorMessage = error.response?.data?.message || "Failed to submit review. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-md p-6 text-center bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-bold text-gray-800">Review Submitted!</h3>
          <p className="text-gray-600">Thank you for your feedback.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Review Product</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="p-6">
          <h3 className="mb-4 font-medium text-gray-800">{productName}</h3>
          
          {/* Star Rating */}
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">Rating</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  } hover:text-yellow-400 transition-colors`}
                >
                  ★
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="mt-1 text-sm text-gray-600">
                {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent'}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Review Comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-shop-dark-pink focus:border-transparent"
              rows={4}
              maxLength={300}
            />
            <div className="text-right">
              <span className="text-xs text-gray-500">{comment.length}/300</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={submitReview}
              disabled={loading || rating === 0 || !comment.trim()}
              className="flex-1 px-4 py-2 text-white transition-colors rounded-lg bg-shop-dark-pink hover:bg-pink-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Buyer Page Component
export default function BuyerPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [complaintOrderId, setComplaintOrderId] = useState<string | null>(null);
  const [reviewProduct, setReviewProduct] = useState<{id: string, name: string} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [buyerEmail, setBuyerEmail] = useState<string>('');
  const [emailLoaded, setEmailLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const searchParams = useSearchParams();

  // ✅ SSR-Safe email management with Google login integration
  useEffect(() => {
    setIsClient(true);
    
    const getUserEmail = () => {
      // Check if we're in the browser
      if (typeof window === 'undefined') {
        return 'user@example.com';
      }
      
      // First, try to get email from Google login
      if (isLoaded && isSignedIn && user) {
        const userEmail = user.primaryEmailAddress?.emailAddress;
        if (userEmail) {
          console.log('✅ Using Google login email:', userEmail);
          return userEmail;
        }
      }
      
      // Fallback to localStorage
      let email = localStorage.getItem('userEmail');
      if (!email) {
        email = prompt('Please enter your email to view orders:') || '';
        if (email && email.includes('@')) {
          localStorage.setItem('userEmail', email);
        } else {
          email = 'user@example.com';
        }
      }
      return email;
    };

    const email = getUserEmail();
    setBuyerEmail(email);
    setEmailLoaded(true);
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    if (!isClient) return;
    
    // Check if redirected from successful payment
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      setShowSuccessMessage(true);
      setTimeout(() => {
        window.history.replaceState({}, '', '/buyer');
        setShowSuccessMessage(false);
      }, 5000);
    }

    // Only fetch orders after email is loaded
    if (emailLoaded && buyerEmail) {
      fetchOrderHistory();
    }
  }, [buyerEmail, emailLoaded, isClient, searchParams]);

  const fetchOrderHistory = async () => {
    if (!buyerEmail) return;
    
    try {
      setError(null);
      setLoading(true);
      
      console.log('Fetching orders for email:', buyerEmail);
      
      const response = await axios.get(`http://localhost:4000/orders?email=${encodeURIComponent(buyerEmail)}`);
      
      console.log('Orders response:', response.data);
      
      if (response.data.success) {
        setOrderHistory(response.data.orders || []);
      } else {
        setError(response.data.message || "Failed to fetch orders");
      }
    } catch (error: any) {
      console.error("Error fetching order history:", error);
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        setError("Unable to connect to server. Please check if your backend is running on port 4000.");
      } else if (error.response?.status === 404) {
        setError("Orders endpoint not found. Please check your backend setup.");
      } else {
        setError("Failed to fetch orders from server");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    // Handle both cents and dollar amounts
    if (amount > 1000) {
      return `$${(amount / 100).toFixed(2)}`; // Convert from cents
    }
    return `$${amount.toFixed(2)}`; // Already in dollars
  };

  const changeEmail = () => {
    if (typeof window === 'undefined') return;
    
    const newEmail = prompt('Enter your email:', buyerEmail);
    if (newEmail && newEmail.includes('@') && newEmail !== buyerEmail) {
      localStorage.setItem('userEmail', newEmail);
      setBuyerEmail(newEmail);
      setOrderHistory([]);
      fetchOrderHistory();
    }
  };

  const refreshOrders = () => {
    fetchOrderHistory();
  };

  // Show loading while email is being loaded or during SSR
  if (!isClient || !emailLoaded) {
    return (
      <main className="min-h-screen pb-10 bg-pink-50">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-shop-dark-pink"></div>
            <p className="text-lg font-medium text-gray-600">Loading...</p>
            <p className="mt-1 text-sm text-gray-500">Preparing your dashboard</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-10 bg-pink-50">
      <div className="max-w-6xl p-8 mx-auto mt-10">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="px-4 py-3 mb-6 text-green-700 bg-green-100 border border-green-400 rounded">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span className="font-bold">Payment Successful!</span>
            </div>
            <p className="mt-1">Your order has been confirmed and will be processed shortly.</p>
          </div>
        )}

        {/* Header */}
        <div className="p-8 mb-10 bg-white border border-pink-100 shadow-lg rounded-xl">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-center text-shop-dark-pink">
            Buyer Dashboard
          </h1>
          <div className="mb-4 text-lg font-semibold text-center text-pink-700">
            Track your orders and manage your purchases
          </div>
          <div className="mb-2 text-center text-gray-600">
            Logged in as: {buyerEmail}
          </div>
          <div className="space-x-4 text-center">
            <button
              onClick={changeEmail}
              className="text-sm text-blue-600 underline hover:text-blue-800"
            >
              Change Email
            </button>
            <button
              onClick={refreshOrders}
              className="text-sm text-green-600 underline hover:text-green-800"
            >
              Refresh Orders
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-6 mb-8 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="font-medium text-red-800">Error Loading Orders</span>
            </div>
            <p className="text-red-700">{error}</p>
            <button
              onClick={refreshOrders}
              className="px-4 py-2 mt-3 text-red-800 transition-colors bg-red-100 rounded hover:bg-red-200"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-shop-dark-pink"></div>
              <p className="text-lg font-medium text-gray-600">Loading your orders...</p>
              <p className="mt-1 text-sm text-gray-500">Please wait a moment</p>
            </div>
          </div>
        )}

        {/* No Orders State */}
        {!loading && !error && orderHistory.length === 0 && (
          <div className="p-12 text-center bg-white rounded-lg shadow-lg">
            <div className="mb-6 text-6xl">📦</div>
            <h2 className="mb-4 text-2xl font-bold text-gray-800">No Orders Found</h2>
            <p className="mb-6 text-gray-600">
              You haven't made any purchases yet, or no orders found for {buyerEmail}
            </p>
            <div className="space-x-4">
              <a
                href="/"
                className="inline-block px-6 py-3 font-semibold text-white transition-colors rounded-lg bg-shop-dark-pink hover:bg-pink-600"
              >
                Start Shopping
              </a>
              <button
                onClick={changeEmail}
                className="inline-block px-6 py-3 font-semibold text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Change Email
              </button>
            </div>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && orderHistory.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Your Orders ({orderHistory.length})
              </h2>
              <div className="text-sm text-gray-600">
                Total Spent: {formatCurrency(orderHistory.reduce((sum, order) => sum + (order.amount || 0), 0))}
              </div>
            </div>

            {orderHistory.map((order) => (
              <div key={order._id} className="p-6 bg-white border border-pink-100 shadow-lg rounded-xl">
                {/* Order Header */}
                <div className="flex flex-col mb-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Order #{order._id.slice(-8)}
                    </h3>
                    <p className="text-gray-600">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                    {order.stripeSessionId && (
                      <p className="text-xs text-gray-500">
                        Payment ID: {order.stripeSessionId.slice(-12)}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 text-right md:mt-0">
                    <p className="text-2xl font-bold text-shop-dark-pink">
                      {formatCurrency(order.amount || 0)}
                    </p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Processing'}
                    </span>
                  </div>
                </div>

                {/* Delivery Status */}
                <div className="mb-6">
                  <h4 className="mb-3 text-sm font-medium text-gray-700">Delivery Status</h4>
                  <DeliveryStepper status={order.status || 'confirmed'} />
                </div>

                {/* Order Items */}
                {order.items && order.items.length > 0 && (
                  <div className="mb-6">
                    <h4 className="mb-3 text-sm font-medium text-gray-700">Items Ordered</h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {order.items.map((item: any, index: number) => (
                        <div key={index} className="flex items-center p-3 rounded-lg bg-pink-50">
                          <div className="w-12 h-12 mr-3 bg-gray-200 rounded">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="object-cover w-full h-full rounded"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{item.name || 'Product'}</p>
                            <p className="text-sm text-gray-600">
                              Qty: {item.quantity || 1} × ${(item.price || 0).toFixed(2)}
                            </p>
                            <button
                              onClick={() => setReviewProduct({
                                id: item.id || item.productId || index.toString(),
                                name: item.name || 'Product'
                              })}
                              className="mt-1 text-xs text-blue-600 underline hover:text-blue-800"
                            >
                              Write Review
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shipping Address */}
                {order.shipping?.address && (
                  <div className="mb-6">
                    <h4 className="mb-2 text-sm font-medium text-gray-700">Shipping Address</h4>
                    <div className="p-3 text-sm text-gray-700 rounded-lg bg-gray-50">
                      <p className="font-medium">{order.shipping.name || buyerEmail}</p>
                      <p>{order.shipping.address.line1}</p>
                      {order.shipping.address.line2 && <p>{order.shipping.address.line2}</p>}
                      <p>
                        {order.shipping.address.city}, {order.shipping.address.state} {order.shipping.address.postal_code}
                      </p>
                      <p>{order.shipping.address.country}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setComplaintOrderId(order._id)}
                    className="px-4 py-2 text-sm font-medium text-red-600 transition-colors rounded-lg bg-red-50 hover:bg-red-100"
                  >
                    Report Issue
                  </button>
                  
                  {order.status === 'delivered' && (
                    <button
                      onClick={() => {
                        const firstItem = order.items?.[0];
                        if (firstItem) {
                          setReviewProduct({
                            id: firstItem.id || firstItem.productId || order._id,
                            name: firstItem.name || 'Product'
                          });
                        }
                      }}
                      className="px-4 py-2 text-sm font-medium text-green-600 transition-colors rounded-lg bg-green-50 hover:bg-green-100"
                    >
                      Leave Review
                    </button>
                  )}
                  
                  {order.stripeSessionId && (
                    <a
                      href={`https://dashboard.stripe.com/test/payments/${order.stripePaymentIntentId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 text-sm font-medium text-blue-600 transition-colors rounded-lg bg-blue-50 hover:bg-blue-100"
                    >
                      View Receipt
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modals */}
        {complaintOrderId && (
          <ComplaintModal
            orderId={complaintOrderId}
            buyerEmail={buyerEmail}
            onClose={() => setComplaintOrderId(null)}
          />
        )}

        {reviewProduct && (
          <ProductReview
            productId={reviewProduct.id}
            buyerEmail={buyerEmail}
            productName={reviewProduct.name}
            onClose={() => setReviewProduct(null)}
          />
        )}
      </div>
    </main>
  );
}