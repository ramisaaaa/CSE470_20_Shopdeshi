const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Order = require('../models/Order');

exports.submitComplaint = async (req, res) => {
  try {
    const { buyerId, sellerId, orderId, message } = req.body;
    const complaint = new Complaint({ complaintId: Date.now(), buyerId, sellerId, orderId, message });
    await complaint.save();
    res.status(201).json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.replyComplaint = async (req, res) => {
  try {
    const { senderId, message } = req.body;
    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    complaint.replies.push({ senderId, message });
    await complaint.save();
    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAllComplaints = async (_req, res) => {
  try {
    const complaints = await Complaint.find({}).populate('buyerId', 'email firstName lastName').populate('sellerId', 'email firstName lastName');
    res.json({ success: true, complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['open','resolved','escalated','closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const complaint = await Complaint.findOneAndUpdate({ complaintId: req.params.id }, { status }, { new: true });
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createOrAppendComplaint = async (req, res) => {
  try {
    const { orderId, message, buyerEmail } = req.body;
    if (!orderId || !message || !buyerEmail) {
      return res.status(400).json({ success: false, message: 'Missing required fields: orderId, message, or buyerEmail' });
    }
    const user = await User.findOne({ email: buyerEmail });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    let complaint = await Complaint.findOne({ orderId: orderId, buyerId: user._id });
    if (!complaint) {
      complaint = new Complaint({ complaintId: Date.now(), buyerId: user._id, sellerId: null, orderId, message, thread: [{ from: 'buyer', message }], replies: [], status: 'open' });
      await complaint.save();
    } else {
      complaint.thread.push({ from: 'buyer', message });
      await complaint.save();
    }
    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error processing complaint' });
  }
};

exports.getComplaintsForAdmin = async (_req, res) => {
  try {
    const complaints = await Complaint.find().populate('buyerId');
    res.json({ success: true, complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.patchComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['open','resolved','escalated','closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


