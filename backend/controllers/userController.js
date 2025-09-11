const User = require('../models/User');

exports.upsertUser = async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName, imageUrl } = req.body || {};
    if (!clerkId || !email) return res.status(400).json({ success: false, message: 'Missing clerkId or email' });
    const update = { email, firstName: firstName || '', lastName: lastName || '', imageUrl: imageUrl || '', lastLoginAt: new Date() };
    const user = await User.findOneAndUpdate(
      { clerkId },
      { $set: update, $setOnInsert: { createdAt: new Date(), clerkId } },
      { upsert: true, new: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.listUsers = async (_req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.findByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: 'email is required' });
    const user = await User.findOne({ email: String(email) });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.findByClerkId = async (req, res) => {
  try {
    const { clerkId } = req.query;
    if (!clerkId) return res.status(400).json({ success: false, message: 'clerkId is required' });
    const user = await User.findOne({ clerkId: String(clerkId) });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


