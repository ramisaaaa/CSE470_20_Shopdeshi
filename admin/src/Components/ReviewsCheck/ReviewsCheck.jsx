import React, { useState, useEffect } from 'react';
import './ReviewsCheck.css';

const API_BASE = 'http://localhost:4000';

const ReviewsCheck = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  const badWords = ['stupid', 'idiot', 'dumb', 'nonsense', 'hate', 
    'trash', 'garbage', 'ugly', 'awful', 'terrible', 'scam', 'fraud',
    'fake', 'cheat', 'disgusting', 'bitch', 'fuck', 'shit', 'damn', 'asshole', 'cunt']

  useEffect(() => {
    fetchAllReviews();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [reviews, filter]);

  // Fetch all products and extract their reviews
  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/allproducts`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const products = await response.json();
      
      let allReviews = [];
      (Array.isArray(products) ? products : []).forEach(product => {
        if (product.reviews && product.reviews.length > 0) {
          product.reviews.forEach(review => {
            const computedHasBad = checkForBadWords(review.comment);
            allReviews.push({
              ...review,
              productId: product.id,
              productName: product.name,
              hasBadWords: review.hasBadWords ?? computedHasBad,
              flagged: review.flagged ?? computedHasBad,
            });
          });
        }
      });
      
      setReviews(allReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      showAlert('Failed to fetch reviews', 'error');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const checkForBadWords = (text) => {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return badWords.some(word => lowerText.includes(word.toLowerCase()));
  };

  const filterReviews = () => {
    if (filter === 'flagged') {
      setFilteredReviews(reviews.filter(review => review.flagged || review.hasBadWords));
    } else if (filter === 'clean') {
      setFilteredReviews(reviews.filter(review => !review.flagged && !review.hasBadWords));
    } else {
      setFilteredReviews(reviews);
    }
  };

  const deleteReview = async (reviewId, productId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/admin/reviews/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, reviewId })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(reviews.filter(review => review._id !== reviewId));
        showAlert('Review deleted successfully', 'success');
      } else {
        showAlert('Failed to delete review', 'error');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      showAlert('Failed to delete review', 'error');
    }
  };

  const approveReview = async (reviewId, productId) => {
    try {
      const response = await fetch(`${API_BASE}/admin/reviews/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, reviewId })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(reviews.map(review => 
          review._id === reviewId ? { ...review, flagged: false, hasBadWords: false } : review
        ));
        showAlert('Review approved', 'success');
      } else {
        showAlert('Failed to approve review', 'error');
      }
    } catch (error) {
      console.error('Error approving review:', error);
      showAlert('Failed to approve review', 'error');
    }
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
  };

  if (loading) {
    return <div className="loading">Loading reviews...</div>;
  }

  return (
    <div className="review-management">
      <div className="review-header">
        <h2>Review Management</h2>
        <div className="filter-controls">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All Reviews ({reviews.length})
          </button>
          <button 
            className={filter === 'flagged' ? 'active' : ''} 
            onClick={() => setFilter('flagged')}
          >
            Flagged Reviews ({reviews.filter(r => r.flagged || r.hasBadWords).length})
          </button>
          <button 
            className={filter === 'clean' ? 'active' : ''} 
            onClick={() => setFilter('clean')}
          >
            Clean Reviews ({reviews.filter(r => !r.flagged && !r.hasBadWords).length})
          </button>
        </div>
      </div>

      {alert.show && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
        </div>
      )}

      <div className="reviews-list">
        {filteredReviews.length === 0 ? (
          <p className="no-reviews">No reviews found.</p>
        ) : (
          filteredReviews.map(review => (
            <div 
              key={review._id} 
              className={`review-item ${review.flagged || review.hasBadWords ? 'flagged' : ''}`}
            >
              <div className="review-content">
                <div className="review-meta">
                  <span className="user">{review.user}</span>
                  <span className="rating">Rating: {review.rating}/5</span>
                  <span className="date">{new Date(review.date).toLocaleDateString()}</span>
                  <span className="product">Product: {review.productName}</span>
                </div>
                <p className="comment">{review.comment}</p>
                {(review.flagged || review.hasBadWords) && (
                  <div className="bad-word-warning">⚠️ This review contains potentially inappropriate content</div>
                )}
              </div>
              <div className="review-actions">
                {(review.flagged || review.hasBadWords) && (
                  <button className="btn-approve" onClick={() => approveReview(review._id, review.productId)}>Approve</button>
                )}
                <button className="btn-delete" onClick={() => deleteReview(review._id, review.productId)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsCheck;