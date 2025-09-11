const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now },
  flagged: { type: Boolean, default: false },
  hasBadWords: { type: Boolean, default: false },
  approved: { type: Boolean, default: false },
});

const ProductSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number, required: true },
  old_price: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true },
  reviews: [ReviewSchema],
  purchases: [{
    userId: String,
    email: String,
    quantity: Number,
    date: { type: Date, default: Date.now },
    deliveryAddress: {
      name: String,
      phone: String,
      address: String,
      city: String,
      postalCode: String,
      country: String,
    }
  }]
});

module.exports = mongoose.model('Product', ProductSchema);


