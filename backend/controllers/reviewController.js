const Review = require('../models/Review');
const User = require('../models/User');
const Product = require('../models/Product');
const { containsBadWords } = require('../utils/badWords');

exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment, buyerEmail } = req.body;
    if (!productId || !rating || !buyerEmail) {
      return res.status(400).json({ success: false, message: 'Missing required fields: productId, rating, or buyerEmail' });
    }
    if (rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    const user = await User.findOne({ email: buyerEmail });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const product = await Product.findOne({ id: parseInt(productId) });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const existingReview = await Review.findOne({ productId: product._id, buyerId: user._id });
    if (existingReview) return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    const review = new Review({ productId: product._id, buyerId: user._id, rating: parseInt(rating), comment: comment || '', date: new Date() });
    await review.save();
    const newProductReview = { user: buyerEmail, rating: parseInt(rating), comment: comment || '', date: new Date(), hasBadWords: containsBadWords(comment || ''), flagged: containsBadWords(comment || ''), approved: !containsBadWords(comment || '') };
    product.reviews.push(newProductReview);
    await product.save();
    res.json({ success: true, message: 'Review submitted successfully', review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error submitting review' });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { rating, comment, buyerEmail } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    const user = await User.findOne({ email: buyerEmail });
    if (!user || !review.buyerId.equals(user._id)) return res.status(403).json({ success: false, message: 'Not allowed' });
    if (Date.now() - review.date.getTime() > 24 * 60 * 60 * 1000) return res.status(400).json({ success: false, message: 'Edit/delete window expired' });
    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    await review.save();
    res.json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { buyerEmail } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    const user = await User.findOne({ email: buyerEmail });
    if (!user || !review.buyerId.equals(user._id)) return res.status(403).json({ success: false, message: 'Not allowed' });
    if (Date.now() - review.date.getTime() > 24 * 60 * 60 * 1000) return res.status(400).json({ success: false, message: 'Delete window expired' });
    await review.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getReviewsForProduct = async (req, res) => {
  try {
    const paramId = String(req.params.productId);
    let mongoProductId = null;

    // If a 24-char hex is provided, use directly; otherwise map numeric id to _id
    if (/^[a-f\d]{24}$/i.test(paramId)) {
      mongoProductId = paramId;
    } else {
      const numericId = Number(paramId);
      if (Number.isFinite(numericId)) {
        const product = await Product.findOne({ id: numericId });
        if (product) mongoProductId = product._id;
      }
    }

    if (!mongoProductId) {
      return res.json({ success: true, reviews: [], avgRating: null });
    }

    const reviews = await Review.find({ productId: mongoProductId });
    const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2) : null;
    res.json({ success: true, reviews, avgRating });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


