const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, index: true },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date, default: Date.now },
  purchases: { type: Array, default: [] }
}, { collection: 'users' });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);


