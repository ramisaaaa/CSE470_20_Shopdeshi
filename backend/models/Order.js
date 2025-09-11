const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  items: [{ id: String, name: String, image: String, price: Number, quantity: Number }],
  amount: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalPrice: { type: Number, default: 0 },
  purchaseDate: { type: Date },
  customerInfo: { type: Object, default: {} },
  status: { type: String, default: 'processing', index: true },
  timeline: [{ status: String, at: { type: Date, default: Date.now }, note: String }],
  stripeSessionId: { type: String, index: true },
  stripePaymentIntentId: { type: String, index: true },
  createdAt: { type: Date, default: Date.now },
  shipping: { name: String, address: Object, phone: String },
  products: [{ productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, quantity: Number }],
}, { collection: 'orders' });

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);


