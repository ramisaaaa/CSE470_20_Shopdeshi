const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendOrderEmail } = require('../utils/mailer');

exports.getOrders = async (req, res) => {
  try {
    const { email, buyerEmail } = req.query;
    const emailToSearch = email || buyerEmail;
    const query = emailToSearch ? { email: String(emailToSearch) } : {};
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching orders' });
  }
};

exports.getPurchaseHistory = async (req, res) => {
  try {
    const { buyerEmail } = req.query;
    if (!buyerEmail) return res.status(400).json({ success: false, message: 'buyerEmail parameter is required' });
    const orders = await Order.find({ email: String(buyerEmail) }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching purchase history' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id, status, note } = req.body || {};
    if (!id || !status) return res.status(400).json({ success: false, message: 'Missing id or status' });
    const order = await Order.findByIdAndUpdate(id, { $set: { status }, $push: { timeline: { status, note: note || '' } } }, { new: true });
    res.json({ success: true, order });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, order });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.patchOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['packaging','delivery_man','shipped','received'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const order = await Order.findByIdAndUpdate(req.params.orderId, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, status: order.status });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.recordPurchaseToUser = async (req, res) => {
  try {
    const { buyerId, products } = req.body;
    if (!buyerId || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid input' });
    }
    const user = await User.findOne({ clerkId: buyerId });
    if (!user) return res.status(404).json({ success: false, message: 'Buyer not found' });
    let totalPrice = 0; const purchaseItems = [];
    for (const item of products) {
      const product = await Product.findOne({ id: item.productId });
      if (product && item.quantity > 0) {
        totalPrice += product.new_price * item.quantity;
        purchaseItems.push({ productId: product.id, name: product.name, quantity: item.quantity, price: product.new_price });
      }
    }
    if (purchaseItems.length === 0) return res.status(400).json({ success: false, message: 'No valid products to purchase' });
    const purchaseRecord = { buyerId, email: user.email, items: purchaseItems, totalPrice, purchaseDate: new Date() };
    user.purchases = user.purchases || [];
    user.purchases.push(purchaseRecord);
    await user.save();
    res.json({ success: true, message: 'Purchase recorded', purchase: purchaseRecord });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


