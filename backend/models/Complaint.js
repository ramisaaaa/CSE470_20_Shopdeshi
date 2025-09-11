const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  complaintId: { type: Number, required: true, unique: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  orderId: { type: String, required: true },
  message: { type: String, required: true },
  thread: [{
    from: { type: String, enum: ['buyer', 'seller', 'admin'], required: true },
    message: String,
    timestamp: { type: Date, default: Date.now }
  }],
  replies: [{
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    timestamp: { type: Date, default: Date.now }
  }],
  status: { type: String, enum: ['open', 'resolved', 'escalated', 'closed'], default: 'open' }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);


