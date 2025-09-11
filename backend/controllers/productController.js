const Product = require('../models/Product');
const { containsBadWords } = require('../utils/badWords');

exports.addProduct = async (req, res) => {
  try {
    const products = await Product.find({});
    const id = products.length > 0 ? products[products.length - 1].id + 1 : 1;
    const product = new Product({
      id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
      reviews: [],
      purchases: [],
    });
    await product.save();
    res.json({ success: true, name: req.body.name });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addReviewToEmbedded = async (req, res) => {
  try {
    const { productId, user, rating, comment } = req.body;
    if (!productId || !user || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }
    const hasBadWords = containsBadWords(comment);
    const newReview = {
      user,
      rating: parseInt(rating),
      comment,
      date: new Date(),
      hasBadWords,
      flagged: hasBadWords,
      approved: !hasBadWords
    };
    const product = await Product.findOne({ id: productId });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    product.reviews.push(newReview);
    await product.save();
    res.json({ success: true, message: hasBadWords ? 'Review added but flagged for moderation' : 'Review added successfully', review: newReview, requiresModeration: hasBadWords });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getEmbeddedReviews = async (req, res) => {
  try {
    const productId = req.params.productId;
    const { filter } = req.query;
    const product = await Product.findOne({ id: productId });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    let reviews = product.reviews;
    if (filter === 'approved') reviews = reviews.filter(r => r.approved);
    else if (filter === 'flagged') reviews = reviews.filter(r => r.flagged);
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAllEmbeddedReviews = async (req, res) => {
  try {
    const { filter } = req.query;
    const products = await Product.find({});
    let allReviews = [];
    products.forEach(product => {
      product.reviews.forEach(review => {
        allReviews.push({ ...review.toObject(), productId: product.id, productName: product.name });
      });
    });
    if (filter === 'flagged') allReviews = allReviews.filter(r => r.flagged);
    else if (filter === 'approved') allReviews = allReviews.filter(r => r.approved);
    allReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ success: true, reviews: allReviews, totalCount: allReviews.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteEmbeddedReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.body;
    const product = await Product.findOne({ id: productId });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    product.reviews = product.reviews.filter(r => r._id.toString() !== reviewId);
    await product.save();
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.approveEmbeddedReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.body;
    const product = await Product.findOne({ id: productId });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const review = product.reviews.id(reviewId);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    review.flagged = false;
    review.approved = true;
    await product.save();
    res.json({ success: true, message: 'Review approved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addPurchaseToProduct = async (req, res) => {
  try {
    const { productId, userId, email, quantity, deliveryAddress } = req.body;
    const product = await Product.findOne({ id: productId });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    product.purchases.push({ userId, email, quantity, deliveryAddress });
    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getUserOrderHistoryFromProducts = async (req, res) => {
  try {
    const { userId } = req.query;
    const products = await Product.find({ 'purchases.userId': userId });
    const orders = products.flatMap(product => product.purchases
      .filter(p => p.userId === userId)
      .map(p => ({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        quantity: p.quantity,
        deliveryAddress: p.deliveryAddress,
        date: p.date
      }))
    );
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.removeProduct = async (req, res) => {
  try {
    await Product.findOneAndDelete({ id: req.body.id });
    res.json({ success: true, name: req.body.name });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

exports.getAllProducts = async (_req, res) => {
  try {
    const products = await Product.find({});
    res.send(products);
  } catch (err) {
    res.status(500).json({ success: false });
  }
};


