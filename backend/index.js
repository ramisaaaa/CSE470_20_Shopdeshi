require('dotenv').config();
const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

console.log('Environment variables:');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PORT:', process.env.SMTP_PORT);


const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

let stripe = null;

if (STRIPE_SECRET_KEY) {
  try {
    const StripeLib = require('stripe');
    stripe = new StripeLib(STRIPE_SECRET_KEY);
    console.log('✅ Stripe initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Stripe:', error.message);
  }
} else {
  console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
}


// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// IMPORTANT: Stripe webhook needs raw body; mount JSON after defining webhook route
// We'll temporarily skip express.json() for the webhook path
app.use((req, res, next) => {
  if (req.originalUrl === '/stripe/webhook') {
    return next();
  }
  return express.json()(req, res, next);
});

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "upload/images");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/shopdeshi";
mongoose.connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(" MongoDB connection error:", err));

// Test
app.get("/", (req, res) => {
  res.send("Express app is running");
});

// Serve uploaded images
app.use('/images', express.static('upload/images'));

// Multer setup
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    return cb(null, `image_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

// Upload endpoint (fix field name to 'image')
app.post("/upload", upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: 0, message: "No file uploaded" });
  }
  const imageUrl = `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;
  res.json({
    success: 1,
    image_url: imageUrl
  });
});

// Bad words list for review moderation
const BAD_WORDS = [
  'stupid', 'idiot', 'dumb', 'nonsense', 'hate', 'trash', 'garbage',
  'ugly', 'awful', 'terrible', 'scam', 'fraud', 'fake', 'cheat',
  'disgusting', 'bitch', 'fuck', 'shit', 'asshole', 'cunt', 'bastard',
  'dick', 'prick', 'piss', 'fucking', 'shitty', 'bullshit',
  'motherfucker', 'dumbass',
];

// Function to check for bad words
function containsBadWords(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return BAD_WORDS.some(word => lowerText.includes(word.toLowerCase()));
}

// Review schema
const ReviewSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  flagged: {
    type: Boolean,
    default: false
  },
  hasBadWords: {
    type: Boolean,
    default: false
  },
  approved: {
    type: Boolean,
    default: false
  }
});

// Fixed Product schema with all fields including reviews and purchases
const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  available: {
    type: Boolean,
    default: true,
  },
  reviews: [ReviewSchema], // Reviews array
  purchases: [ // Purchases array - FIXED: Now inside the schema
    {
      userId: String,
      email: String,
      quantity: Number,
      date: {
        type: Date,
        default: Date.now
      },
      deliveryAddress: {
        name: String,
        phone: String,
        address: String,
        city: String,
        postalCode: String,
        country: String
      }
    }
  ]
});

// Add product endpoint
app.post('/addproduct', async (req, res) => {
  try {
    let products = await Product.find({});
    let id = products.length > 0 ? products[products.length - 1].id + 1 : 1;

    const product = new Product({
      id: id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
      reviews: [], // Initialize with empty reviews array
      purchases: [], // Initialize with empty purchases array
    });

    await product.save();
    console.log("Product saved:", product);
    res.json({
      success: true,
      name: req.body.name,
    });
  } catch (err) {
    console.error("Error saving product:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Add review to product (with bad word check)
app.post('/addreview', async (req, res) => {
  try {
    const { productId, user, rating, comment } = req.body;

    if (!productId || !user || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    // Check for bad words
    const hasBadWords = containsBadWords(comment);

    const newReview = {
      user: user,
      rating: parseInt(rating),
      comment: comment,
      date: new Date(),
      hasBadWords: hasBadWords,
      flagged: hasBadWords, // Auto-flag if contains bad words
      approved: !hasBadWords // Auto-approve if no bad words
    };

    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    product.reviews.push(newReview);
    await product.save();

    console.log(`Review added to product ${productId}:`, newReview);
    res.json({
      success: true,
      message: hasBadWords ? "Review added but flagged for moderation" : "Review added successfully",
      review: newReview,
      requiresModeration: hasBadWords
    });
  } catch (err) {
    console.error("Error adding review:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get reviews for a specific product (with optional filtering)
app.get('/reviews/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const { filter } = req.query; // 'all', 'approved', 'flagged'

    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    let reviews = product.reviews;

    // Apply filters if specified
    if (filter === 'approved') {
      reviews = reviews.filter(review => review.approved);
    } else if (filter === 'flagged') {
      reviews = reviews.filter(review => review.flagged);
    }

    res.json({
      success: true,
      reviews: reviews
    });
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all reviews across all products (for admin moderation)
app.get('/admin/reviews', async (req, res) => {
  try {
    const { filter } = req.query; // 'all', 'flagged', 'approved'

    const products = await Product.find({});

    // Extract all reviews with product information
    let allReviews = [];
    products.forEach(product => {
      product.reviews.forEach(review => {
        allReviews.push({
          ...review.toObject(),
          productId: product.id,
          productName: product.name
        });
      });
    });

    // Apply filters
    if (filter === 'flagged') {
      allReviews = allReviews.filter(review => review.flagged);
    } else if (filter === 'approved') {
      allReviews = allReviews.filter(review => review.approved);
    }

    // Sort by date (newest first)
    allReviews.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      reviews: allReviews,
      totalCount: allReviews.length
    });
  } catch (err) {
    console.error("Error fetching all reviews:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete a specific review from a product
app.delete('/admin/reviews/delete', async (req, res) => {
  try {
    const { productId, reviewId } = req.body;

    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Remove the review
    product.reviews = product.reviews.filter(review => review._id.toString() !== reviewId);
    await product.save();

    res.json({
      success: true,
      message: "Review deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Approve a flagged review
app.put('/admin/reviews/approve', async (req, res) => {
  try {
    const { productId, reviewId } = req.body;

    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Find and update the review
    const review = product.reviews.id(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    review.flagged = false;
    review.approved = true;
    await product.save();

    res.json({
      success: true,
      message: "Review approved successfully"
    });
  } catch (err) {
    console.error("Error approving review:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Add product purchase endpoint
app.post('/product/purchase', async (req, res) => {
  try {
    const { productId, userId, email, quantity, deliveryAddress } = req.body;

    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    product.purchases.push({
      userId,
      email,
      quantity,
      deliveryAddress
    });

    await product.save();
    res.json({
      success: true,
      product
    });
  } catch (err) {
    console.error("Error updating purchase info:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get user order history
app.get('/user/order-history', async (req, res) => {
  try {
    const { userId } = req.query;

    const products = await Product.find({ "purchases.userId": userId });
    const orders = products.flatMap(product =>
      product.purchases
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

    res.json({
      success: true,
      orders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete product
app.post('/removeproduct', async (req, res) => {
  try {
    await Product.findOneAndDelete({ id: req.body.id });
    console.log("Removed product ID:", req.body.id);
    res.json({
      success: true,
      name: req.body.name
    });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ success: false });
  }
});

// Get all products
// In your backend index.js
app.get('/allproducts', async (req, res) => {
  try {
    let products = await Product.find({});
    
    // Debug: Log first product structure
    if (products.length > 0) {
      console.log('Sample product structure:', {
        id: products[0].id,
        name: products[0].name,
        new_price: products[0].new_price,
        old_price: products[0].old_price,
        allFields: Object.keys(products[0].toObject())
      });
    }
    
    res.send(products);
  } catch (err) {
    res.status(500).json({ success: false });
  }
});


// Tutorial Video schema
const TutorialSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  youtubeUrl: {
    type: String,
    required: true,
  },
  videoId: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  views: {
    type: Number,
    default: 0,
  }
});

const Tutorial = mongoose.model("Tutorial", TutorialSchema);

// Helper function to extract YouTube video ID
function extractVideoId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

// Add tutorial video
app.post('/addtutorial', async (req, res) => {
  try {
    const { title, description, youtubeUrl, author } = req.body;

    if (!title || !description || !youtubeUrl || !author) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: "Invalid YouTube URL"
      });
    }

    // Get next ID
    let tutorials = await Tutorial.find({});
    let id = tutorials.length > 0 ? tutorials[tutorials.length - 1].id + 1 : 1;

    const tutorial = new Tutorial({
      id: id,
      title: title,
      description: description,
      youtubeUrl: `https://www.youtube.com/embed/${videoId}`,
      videoId: videoId,
      author: author,
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    });

    await tutorial.save();
    console.log("Tutorial saved:", tutorial);
    res.json({
      success: true,
      message: "Tutorial added successfully",
      tutorial: tutorial
    });
  } catch (err) {
    console.error("Error saving tutorial:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all tutorials
app.get('/alltutorials', async (req, res) => {
  try {
    let tutorials = await Tutorial.find({}).sort({ date: -1 });
    console.log("All Tutorials Fetched");
    res.json({
      success: true,
      tutorials: tutorials
    });
  } catch (err) {
    console.error("Error fetching tutorials:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get single tutorial
app.get('/tutorial/:id', async (req, res) => {
  try {
    const tutorialId = parseInt(req.params.id);
    const tutorial = await Tutorial.findOne({ id: tutorialId });

    if (!tutorial) {
      return res.status(404).json({
        success: false,
        message: "Tutorial not found"
      });
    }

    // Increment view count
    tutorial.views += 1;
    await tutorial.save();

    res.json({
      success: true,
      tutorial: tutorial
    });
  } catch (err) {
    console.error("Error fetching tutorial:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete tutorial
app.post('/removetutorial', async (req, res) => {
  try {
    const tutorialId = req.body.id;
    const deletedTutorial = await Tutorial.findOneAndDelete({ id: tutorialId });

    if (!deletedTutorial) {
      return res.status(404).json({
        success: false,
        message: "Tutorial not found"
      });
    }

    console.log("Removed tutorial ID:", tutorialId);
    res.json({
      success: true,
      message: "Tutorial deleted successfully",
      title: deletedTutorial.title
    });
  } catch (err) {
    console.error("Error deleting tutorial:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Search tutorials
app.get('/searchtutorials', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }

    const tutorials = await Tutorial.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { author: { $regex: q, $options: 'i' } }
      ]
    }).sort({ date: -1 });

    res.json({
      success: true,
      tutorials: tutorials,
      count: tutorials.length
    });
  } catch (err) {
    console.error("Error searching tutorials:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// User schema & collection
const UserSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    index: true
  },
  firstName: {
    type: String,
    default: ''
  },
  lastName: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
}, {
  collection: 'users'
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Upsert user from frontend auth (Clerk)
app.post('/users/upsert', async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName, imageUrl } = req.body || {};

    if (!clerkId || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing clerkId or email'
      });
    }

    const update = {
      email,
      firstName: firstName || '',
      lastName: lastName || '',
      imageUrl: imageUrl || '',
      lastLoginAt: new Date(),
    };

    const user = await User.findOneAndUpdate(
      { clerkId },
      {
        $set: update,
        $setOnInsert: { createdAt: new Date(), clerkId }
      },
      { upsert: true, new: true }
    );

    console.log('User upserted:', user?.clerkId, user?.email);
    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error('Error upserting user:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// List all users (for admin)
app.get('/users/all', async (_req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      users
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Find by email
app.get('/users/by-email', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: 'email is required' });

    const user = await User.findOne({ email: String(email) });
    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error('Error fetching user by email:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Find by clerkId
app.get('/users/by-id', async (req, res) => {
  try {
    const { clerkId } = req.query;
    if (!clerkId) return res.status(400).json({ success: false, message: 'clerkId is required' });

    const user = await User.findOne({ clerkId: String(clerkId) });
    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error('Error fetching user by clerkId:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Order schema
const OrderSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  items: [{
    id: String,
    name: String,
    image: String,
    price: Number,
    quantity: Number,
  }],
  amount: {
    type: Number,
    required: true
  }, // cents
  currency: {
    type: String,
    default: 'usd'
  },
  // Additional fields used by payment confirmation logic
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  purchaseDate: {
    type: Date
  },
  customerInfo: {
    type: Object,
    default: {}
  },
  status: {
    type: String,
    default: 'processing',
    index: true
  },
  timeline: [{
    status: String,
    at: {
      type: Date,
      default: Date.now
    },
    note: String,
  }],
  stripeSessionId: {
    type: String,
    index: true
  },
  stripePaymentIntentId: {
    type: String,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  shipping: {
    name: String,
    address: Object,
    phone: String,
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: Number
  }],
}, {
  collection: 'orders'
});

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

// Stripe webhook (raw body) - must come after Order model definition

// Replace the existing Stripe webhook handler with this:
app.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    console.log('Stripe webhook: Configuration missing');
    return res.status(500).send('Stripe not configured');
  }

  let event;
  try {
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Stripe webhook received:', event.type);

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('Processing completed session:', session.id);

      // Idempotency: skip if we already processed this session
      const existing = await Order.findOne({ stripeSessionId: session.id });
      if (existing) {
        console.log('Order already exists for session, skipping:', session.id);
        return res.json({ received: true, duplicate: true });
      }
      
      // Extract customer information
      const customerEmail = session.customer_details?.email || session.customer_email || 'unknown@example.com';
      const customerName = session.customer_details?.name || session.shipping?.name || 'Unknown Customer';
      const customerPhone = session.customer_details?.phone || session.shipping?.phone || '';
      
      // Extract shipping information
      const shipping = session.shipping_details || session.shipping || {};
      const shippingAddress = shipping.address || {};
      
      // Extract payment information
      const amount_total = session.amount_total || 0;
      const currency = session.currency || 'usd';
      
      // Parse items from metadata
      let items = [];
      let customerInfo = {};
      
      if (session.metadata) {
        try {
          if (session.metadata.items) {
            items = JSON.parse(session.metadata.items);
          }
          if (session.metadata.customerInfo) {
            customerInfo = JSON.parse(session.metadata.customerInfo);
          }
        } catch (parseError) {
          console.error('Error parsing metadata:', parseError);
        }
      }

      console.log('Extracted data:', {
        email: customerEmail,
        name: customerName,
        items: items.length,
        amount: amount_total,
        shipping: shippingAddress
      });

      // Find or create user
      let user = await User.findOne({ email: customerEmail });
      if (!user) {
        console.log('Creating new user for:', customerEmail);
        user = await User.create({
          email: customerEmail,
          clerkId: `stripe_${session.id}_${Date.now()}`,
          firstName: customerName.split(' ')[0] || '',
          lastName: customerName.split(' ').slice(1).join(' ') || '',
          createdAt: new Date()
        });
      }

      console.log('User found/created:', user._id);

      // Create comprehensive order record
      const orderData = {
        email: customerEmail,
        items: items.map(item => ({
          id: item.id || item.productId,
          name: item.name || 'Unknown Product',
          image: item.image || '',
          price: Number(item.price || item.new_price || 0),
          quantity: Number(item.quantity || 1)
        })),
        amount: amount_total,
        currency: currency,
        status: 'confirmed',
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent,
        buyerId: user._id,
        totalPrice: amount_total / 100, // Convert from cents
        purchaseDate: new Date(),
        createdAt: new Date(),
        
        // Customer information
        customerInfo: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          ...customerInfo // Include any additional info from frontend
        },
        
        // Shipping information
        shipping: {
          name: shipping.name || customerName,
          phone: shipping.phone || customerPhone,
          address: {
            line1: shippingAddress.line1 || '',
            line2: shippingAddress.line2 || '',
            city: shippingAddress.city || '',
            state: shippingAddress.state || '',
            postal_code: shippingAddress.postal_code || '',
            country: shippingAddress.country || ''
          }
        },
        
        // Timeline tracking
        timeline: [{
          status: 'confirmed',
          at: new Date(),
          note: 'Payment confirmed via Stripe'
        }],
        
        // Products array for references
        products: []
      };

      console.log('Creating order with data:', JSON.stringify(orderData, null, 2));

      // Create order in database
      const order = await Order.create(orderData);
      console.log('Order created successfully:', order._id);

      // Update product purchases and create product references
      for (const item of items) {
        try {
          const productDoc = await Product.findOne({ id: Number(item.id) });
          if (productDoc) {
            console.log(`Updating product ${productDoc.name} purchases`);
            
            // Add to product purchases array
            productDoc.purchases.push({
              userId: user._id.toString(),
              email: customerEmail,
              quantity: Number(item.quantity || 1),
              date: new Date(),
              deliveryAddress: {
                name: shipping.name || customerName,
                phone: shipping.phone || customerPhone,
                address: shippingAddress.line1 || '',
                city: shippingAddress.city || '',
                postalCode: shippingAddress.postal_code || '',
                country: shippingAddress.country || ''
              }
            });
            
            await productDoc.save();
            
            // Add product reference to order
            order.products.push({
              productId: productDoc._id,
              quantity: Number(item.quantity || 1)
            });
          }
        } catch (productError) {
          console.error(`Error updating product ${item.id}:`, productError);
        }
      }

      // Save order with product references
      await order.save();
      console.log('Order updated with product references');

      // Send confirmation email (if email system is configured)
      try {
        const itemsList = items.map(item => 
          `${item.name} x${item.quantity} - $${(Number(item.price || 0)).toFixed(2)}`
        ).join('\n');
        
        await sendOrderEmail(customerEmail, 'Order Confirmation - Shopdeshi', `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e91e63;">Thank you for your order!</h2>
            <p>Hi ${customerName},</p>
            <p>Your payment has been successfully processed.</p>
            
            <div style="background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <h3>Order Details:</h3>
              <p><strong>Order ID:</strong> ${order._id}</p>
              <p><strong>Total:</strong> $${(amount_total / 100).toFixed(2)} ${currency.toUpperCase()}</p>
              <p><strong>Payment Method:</strong> Card ending in ${session.payment_method_types?.[0] || 'Card'}</p>
            </div>
            
            <div style="background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <h3>Items Ordered:</h3>
              <pre style="white-space: pre-wrap;">${itemsList}</pre>
            </div>
            
            ${shipping.address ? `
            <div style="background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <h3>Shipping Address:</h3>
              <p>${shipping.name || customerName}<br>
              ${shippingAddress.line1}<br>
              ${shippingAddress.line2 ? shippingAddress.line2 + '<br>' : ''}
              ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postal_code}<br>
              ${shippingAddress.country}</p>
            </div>
            ` : ''}
            
            <p>We'll send you tracking information once your order ships.</p>
            <p>Thank you for shopping with Shopdeshi!</p>
          </div>
        `);
        console.log('Confirmation email sent to:', customerEmail);
      } catch (emailError) {
        console.error('Email sending failed:', emailError.message);
      }

      console.log('Webhook processing completed successfully');
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handling error:', error);
    res.status(500).send('Webhook handler failed: ' + error.message);
  }
});


// Email transporter function
// Replace line 1137 with this corrected version:
function getMailer() {
  if (!nodemailer) {
    console.log('Nodemailer not available');
    return null;
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    // Try service-based config as a fallback (e.g., Gmail, Mailgun)
    if (process.env.SMTP_SERVICE && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: process.env.SMTP_SERVICE,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        });
        return transporter;
      } catch (e) {
        console.log('Failed to create service-based transporter:', e?.message);
        return null;
      }
    }
    console.log('SMTP not configured properly');
    return null;
  }

  try {
    // ✅ CORRECT METHOD NAME
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: String(process.env.SMTP_PORT) === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    transporter.verify((error, success) => {
      if (error) {
        console.log('SMTP Connection Error:', error);
      } else {
        console.log('SMTP Server is ready to send emails');
      }
    });

    return transporter;
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    return null;
  }
}

// Send order email function
async function sendOrderEmail(email, subject, html) {
  console.log('Attempting to send email to:', email);

  const transporter = getMailer();
  if (!transporter) {
    console.log('Cannot send email: No transporter available');
    return false;
  }

  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject,
      html
    };

    console.log('Mail options:', { from: mailOptions.from, to: mailOptions.to, subject: mailOptions.subject });

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email send failed:', error.message);
    console.error('Full error:', error);
    throw error;
  }
}

// FIXED: Orders API endpoints
app.get('/orders', async (req, res) => {
  try {
    // Handle both 'email' and 'buyerEmail' query parameters
    const { email, buyerEmail } = req.query;
    const emailToSearch = email || buyerEmail;
    
    const query = emailToSearch ? { email: String(emailToSearch) } : {};
    const orders = await Order.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching orders' 
    });
  }
});

// FIXED: Add the missing /api/purchase-history endpoint that your frontend expects
app.get('/api/purchase-history', async (req, res) => {
  try {
    const { buyerEmail } = req.query;
    
    if (!buyerEmail) {
      return res.status(400).json({
        success: false,
        message: 'buyerEmail parameter is required'
      });
    }

    // Find orders by email
    const orders = await Order.find({ email: String(buyerEmail) }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error('Error fetching purchase history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching purchase history' 
    });
  }
});

app.put('/orders/status', async (req, res) => {
  try {
    const { id, status, note } = req.body || {};
    if (!id || !status) return res.status(400).json({ success: false, message: 'Missing id or status' });

    const order = await Order.findByIdAndUpdate(
      id,
      {
        $set: { status },
        $push: { timeline: { status, note: note || '' } }
      },
      { new: true }
    );

    res.json({
      success: true,
      order
    });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Not found' });

    res.json({
      success: true,
      order
    });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Test email endpoint
app.post('/test-email', express.json(), async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    console.log('Testing email configuration...');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_USER:', process.env.SMTP_USER);

    // Test the email function directly
    const result = await sendOrderEmail(
      email,
      'Test Email from Shopdeshi',
      '<h1>Test Email</h1><p>This is a test email from your ecommerce site.</p>'
    );

    if (result) {
      res.json({
        success: true,
        message: 'Test email sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email'
      });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create an API endpoint that saves purchased products into MongoDB for a buyer.
// Each record should include: buyerId, productId(s), quantity, totalPrice, purchaseDate.
// Link buyerId with User schema. Fetch buyer's purchase history when requested.
app.post('/purchase', async (req, res) => {
  try {
    const { buyerId, products } = req.body; // products: [{ productId, quantity }]

    if (!buyerId || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input'
      });
    }

    const user = await User.findOne({ clerkId: buyerId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Buyer not found'
      });
    }

    let totalPrice = 0;
    const purchaseItems = [];

    for (const item of products) {
      const product = await Product.findOne({ id: item.productId });
      if (product && item.quantity > 0) {
        totalPrice += product.new_price * item.quantity;
        purchaseItems.push({
          productId: product.id,
          name: product.name,
          quantity: item.quantity,
          price: product.new_price
        });
      }
    }

    if (purchaseItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid products to purchase'
      });
    }

    const purchaseRecord = {
      buyerId,
      email: user.email,
      items: purchaseItems,
      totalPrice,
      purchaseDate: new Date()
    };

    // Save purchase record to user's purchases array
    user.purchases = user.purchases || [];
    user.purchases.push(purchaseRecord);
    await user.save();

    res.json({
      success: true,
      message: 'Purchase recorded',
      purchase: purchaseRecord
    });
  } catch (err) {
    console.error('Error recording purchase:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update order status endpoint
app.patch("/api/order/:orderId/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["packaging", "delivery_man", "shipped", "received"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({
      success: false,
      message: "Order not found"
    });

    res.json({
      success: true,
      order
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get order status endpoint
app.get("/api/order/:orderId/status", async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({
      success: false,
      message: "Order not found"
    });

    res.json({
      success: true,
      status: order.status
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Complaint schema
const ComplaintSchema = new mongoose.Schema({
  complaintId: {
    type: Number,
    required: true,
    unique: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  orderId: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  thread: [{
    from: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      required: true
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  replies: [{
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ["open", "resolved", "escalated", "closed"],
    default: "open"
  },
}, {
  timestamps: true
});

const Complaint = mongoose.model("Complaint", ComplaintSchema);

// Submit a complaint
app.post('/complaints', async (req, res) => {
  try {
    const { buyerId, sellerId, orderId, message } = req.body;

    const complaint = new Complaint({
      complaintId: Date.now(),
      buyerId,
      sellerId,
      orderId,
      message
    });

    await complaint.save();
    res.status(201).json({
      success: true,
      complaint
    });
  } catch (err) {
    console.error('Error submitting complaint:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reply to a complaint
app.post('/complaints/:id/reply', async (req, res) => {
  try {
    const { senderId, message } = req.body;

    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    complaint.replies.push({ senderId, message });
    await complaint.save();

    res.json({
      success: true,
      complaint
    });
  } catch (err) {
    console.error('Error replying to complaint:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all complaints (admin)
app.get('/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find({})
      .populate('buyerId', 'email firstName lastName')
      .populate('sellerId', 'email firstName lastName');

    res.json({
      success: true,
      complaints
    });
  } catch (err) {
    console.error('Error fetching complaints:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update complaint status (admin)
app.patch('/complaints/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['open', 'resolved', 'escalated', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const complaint = await Complaint.findOneAndUpdate(
      { complaintId: req.params.id },
      { status },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.json({
      success: true,
      complaint
    });
  } catch (err) {
    console.error('Error updating complaint status:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Review schema (standalone)
const ReviewSchema2 = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: String,
  date: {
    type: Date,
    default: Date.now
  }
});

const Review = mongoose.model("Review", ReviewSchema2);

// FIXED: Create a complaint or add to thread - matches frontend expectations
app.post("/api/complaint", async (req, res) => {
  try {
    const { orderId, message, buyerEmail } = req.body;

    if (!orderId || !message || !buyerEmail) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: orderId, message, or buyerEmail"
      });
    }

    // Find the user by email
    const user = await User.findOne({ email: buyerEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Check if a complaint already exists for this order
    let complaint = await Complaint.findOne({ 
      orderId: orderId, 
      buyerId: user._id 
    });

    if (!complaint) {
      // Create new complaint
      complaint = new Complaint({
        complaintId: Date.now(), // Simple ID generation
        buyerId: user._id,
        sellerId: null, // You might want to add seller logic here
        orderId: orderId,
        message: message,
        thread: [{ from: "buyer", message: message }],
        replies: [],
        status: "open"
      });
      await complaint.save();
    } else {
      // Add to existing complaint thread
      complaint.thread.push({ from: "buyer", message: message });
      await complaint.save();
    }

    res.json({
      success: true,
      complaint: complaint
    });
  } catch (error) {
    console.error("Error creating/updating complaint:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error processing complaint" 
    });
  }
});

// Get complaints for admin dashboard
app.get("/api/complaints", async (req, res) => {
  try {
    const complaints = await Complaint.find().populate("buyerId");
    res.json({
      success: true,
      complaints
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Mark complaint as resolved or escalate
app.patch("/api/complaint/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["open", "resolved", "escalated"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!complaint) return res.status(404).json({
      success: false,
      message: "Complaint not found"
    });

    res.json({
      success: true,
      complaint
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// FIXED: Add a review - matches frontend expectations
app.post("/api/review", async (req, res) => {
  try {
    const { productId, rating, comment, buyerEmail } = req.body;

    if (!productId || !rating || !buyerEmail) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: productId, rating, or buyerEmail"
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    // Find the user by email
    const user = await User.findOne({ email: buyerEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Find the product by ID (your frontend sends the numeric id, not MongoDB _id)
    const product = await Product.findOne({ id: parseInt(productId) });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // Check for existing review from this user for this product (prevent duplicates)
    const existingReview = await Review.findOne({
      productId: product._id, // Use MongoDB _id for the Review collection
      buyerId: user._id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product"
      });
    }

    // Create the review
    const review = new Review({
      productId: product._id, // Use MongoDB _id
      buyerId: user._id,
      rating: parseInt(rating),
      comment: comment || "",
      date: new Date()
    });

    await review.save();

    // Also add the review to the product's reviews array for backwards compatibility
    const newProductReview = {
      user: buyerEmail,
      rating: parseInt(rating),
      comment: comment || "",
      date: new Date(),
      hasBadWords: containsBadWords(comment || ""),
      flagged: containsBadWords(comment || ""),
      approved: !containsBadWords(comment || "")
    };

    product.reviews.push(newProductReview);
    await product.save();

    res.json({
      success: true,
      message: "Review submitted successfully",
      review: review
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error submitting review" 
    });
  }
});

// Edit or delete review within 24 hours
app.patch("/api/review/:id", async (req, res) => {
  try {
    const { rating, comment, buyerEmail } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({
      success: false,
      message: "Review not found"
    });

    const user = await User.findOne({ email: buyerEmail });
    if (!user || !review.buyerId.equals(user._id)) {
      return res.status(403).json({
        success: false,
        message: "Not allowed"
      });
    }

    if (Date.now() - review.date.getTime() > 24 * 60 * 60 * 1000) {
      return res.status(400).json({
        success: false,
        message: "Edit/delete window expired"
      });
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    await review.save();

    res.json({
      success: true,
      review
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.delete("/api/review/:id", async (req, res) => {
  try {
    const { buyerEmail } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({
      success: false,
      message: "Review not found"
    });

    const user = await User.findOne({ email: buyerEmail });
    if (!user || !review.buyerId.equals(user._id)) {
      return res.status(403).json({
        success: false,
        message: "Not allowed"
      });
    }

    if (Date.now() - review.date.getTime() > 24 * 60 * 60 * 1000) {
      return res.status(400).json({
        success: false,
        message: "Delete window expired"
      });
    }

    await review.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get reviews and average rating for a product
app.get("/api/reviews/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId });
    const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2) : null;

    res.json({
      success: true,
      reviews,
      avgRating
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// Create Stripe checkout session
// FINAL CORRECTED VERSION - Replace your existing endpoint with this:
app.post('/api/create-checkout-session', async (req, res) => {
  console.log('=== CHECKOUT SESSION START ===');
  console.log('Raw request body:', JSON.stringify(req.body, null, 2));
  
  try {
    // Check Stripe initialization
    if (!stripe) {
      console.error('❌ Stripe not initialized');
      return res.status(500).json({ 
        success: false, 
        message: 'Payment system not available' 
      });
    }

    const { items, customerInfo, successUrl, cancelUrl } = req.body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('❌ Invalid items:', items);
      return res.status(400).json({ 
        success: false, 
        message: 'No items provided' 
      });
    }

    // Validate customer info
    if (!customerInfo?.email) {
      console.error('❌ Missing customer email');
      return res.status(400).json({ 
        success: false, 
        message: 'Customer email is required' 
      });
    }

    console.log('✅ Basic validation passed');

    // Process each item
    const lineItems = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`Processing item ${i + 1}:`, {
        name: item.name,
        price: item.price,
        new_price: item.new_price,
        quantity: item.quantity,
        imageType: typeof item.image
      });
      
      // Extract price
      let price = Number(item.price || item.new_price || 0);
      let quantity = Number(item.quantity || 1);
      
      // Validate price
      if (price <= 0 || isNaN(price)) {
        console.error(`❌ Invalid price for ${item.name}: ${price}`);
        return res.status(400).json({ 
          success: false, 
          message: `Invalid price for item: ${item.name || 'Unknown item'}` 
        });
      }

      // Validate quantity
      if (quantity <= 0 || isNaN(quantity)) {
        console.error(`❌ Invalid quantity for ${item.name}: ${quantity}`);
        return res.status(400).json({ 
          success: false, 
          message: `Invalid quantity for item: ${item.name || 'Unknown item'}` 
        });
      }

      // Handle image URL - FIX THE COMPLEX OBJECT ISSUE
      let imageUrl = null;
      if (item.image) {
        if (typeof item.image === 'string') {
          imageUrl = item.image;
        } else if (typeof item.image === 'object' && item.image.src) {
          imageUrl = item.image.src;
        }
        
        // Make absolute URL if relative
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = `${req.protocol}://${req.get('host')}${imageUrl}`;
        }
      }

      // Create line item for Stripe
      const lineItem = {
        price_data: {
          currency: 'usd',
          product_data: {
            name: String(item.name || `Product ${item.id || i + 1}`),
            // Only add images if we have a valid string URL
            ...(imageUrl && typeof imageUrl === 'string' ? { images: [imageUrl] } : {})
          },
          unit_amount: Math.round(price * 100), // Convert to cents
        },
        quantity: quantity,
      };

      console.log(`✅ Line item ${i + 1} created:`, {
        name: lineItem.price_data.product_data.name,
        amount: lineItem.price_data.unit_amount,
        quantity: lineItem.quantity,
        hasImage: !!imageUrl
      });

      lineItems.push(lineItem);
    }

    if (lineItems.length === 0) {
      console.error('❌ No valid line items created');
      return res.status(400).json({ 
        success: false, 
        message: 'No valid items to process' 
      });
    }

    console.log(`✅ Created ${lineItems.length} line items`);

    // Prepare metadata - CLEAN THE ITEMS DATA
    const cleanItems = items.map(item => ({
      id: item.id,
      name: item.name,
      price: Number(item.price || item.new_price || 0),
      quantity: Number(item.quantity || 1),
      image: typeof item.image === 'string' ? item.image : 
             (typeof item.image === 'object' && item.image?.src ? item.image.src : '')
    }));

    // Create Stripe session
    const sessionData = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      // Always ensure success_url contains the session id placeholder
      success_url: (successUrl && successUrl.includes('{CHECKOUT_SESSION_ID}'))
        ? successUrl
        : `${(successUrl || 'http://localhost:3000/success_payment')}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `http://localhost:3000/cart`,
      customer_email: customerInfo.email,
      metadata: {
        items: JSON.stringify(cleanItems),
        customerInfo: JSON.stringify(customerInfo)
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'BD', 'IN', 'DE', 'FR'],
      },
    };

    console.log('Creating Stripe session...');
    console.log('Session data:', JSON.stringify(sessionData, null, 2));
    
    const session = await stripe.checkout.sessions.create(sessionData);

    console.log('✅ Stripe session created:', session.id);
    console.log('Session URL:', session.url);
    console.log('Success URL will be:', sessionData.success_url.replace('{CHECKOUT_SESSION_ID}', session.id));
    
    res.json({ 
      success: true, 
      url: session.url, 
      sessionId: session.id 
    });

  } catch (error) {
    console.error('=== CHECKOUT ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // More specific error handling
    let errorMessage = 'Checkout failed';
    let statusCode = 500;
    
    if (error.type?.includes('Stripe')) {
      errorMessage = `Payment error: ${error.message}`;
      statusCode = 400;
    } else if (error.message?.includes('Invalid')) {
      errorMessage = error.message;
      statusCode = 400;
    } else {
      errorMessage = 'Internal server error during checkout';
    }
    
    res.status(statusCode).json({ 
      success: false, 
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Manual payment verification endpoint (for development)
app.post('/api/verify-payment', async (req, res) => {
  console.log('=== PAYMENT VERIFICATION ENDPOINT CALLED ===');
  console.log('Request body:', req.body);
  
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      console.log('❌ No session ID provided');
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }
    
    console.log('✅ Session ID received:', sessionId);

    if (!stripe) {
      return res.status(500).json({
        success: false,
        message: 'Stripe not configured'
      });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Idempotency: avoid duplicate order creation for the same session
    const existing = await Order.findOne({ stripeSessionId: sessionId });
    if (existing) {
      return res.json({
        success: true,
        message: 'Order already exists for this session',
        order: existing
      });
    }
    
    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }

    // Process the payment (same logic as webhook)
    const customerEmail = session.customer_details?.email || session.customer_email || 'unknown@example.com';
    const customerName = session.customer_details?.name || session.shipping?.name || 'Unknown Customer';
    const customerPhone = session.customer_details?.phone || session.shipping?.phone || '';
    
    const shipping = session.shipping_details || session.shipping || {};
    const shippingAddress = shipping.address || {};
    
    const amount_total = session.amount_total || 0;
    const currency = session.currency || 'usd';
    
    // Parse items from metadata
    let items = [];
    let customerInfo = {};
    
    if (session.metadata) {
      try {
        if (session.metadata.items) {
          items = JSON.parse(session.metadata.items);
        }
        if (session.metadata.customerInfo) {
          customerInfo = JSON.parse(session.metadata.customerInfo);
        }
      } catch (parseError) {
        console.error('Error parsing metadata:', parseError);
      }
    }

    console.log('Processing payment verification for session:', sessionId);
    console.log('Customer:', customerEmail, 'Items:', items.length);
    
    // Check what products exist in database
    const allProducts = await Product.find({});
    console.log('=== DATABASE PRODUCTS ===');
    console.log('Total products in database:', allProducts.length);
    if (allProducts.length > 0) {
      console.log('Sample product IDs:', allProducts.slice(0, 3).map(p => ({ id: p.id, name: p.name })));
    }

    // Find or create user
    let user = await User.findOne({ email: customerEmail });
    if (!user) {
      console.log('Creating new user for:', customerEmail);
      user = await User.create({
        email: customerEmail,
        clerkId: `stripe_${sessionId}_${Date.now()}`,
        firstName: customerName.split(' ')[0] || '',
        lastName: customerName.split(' ').slice(1).join(' ') || '',
        createdAt: new Date()
      });
    }

    console.log('User found/created:', user._id);

    // Create order record
    const orderData = {
      email: customerEmail,
      items: items.map(item => ({
        id: item.id || item.productId,
        name: item.name || 'Unknown Product',
        image: item.image || '',
        price: Number(item.price || item.new_price || 0),
        quantity: Number(item.quantity || 1)
      })),
      amount: amount_total,
      currency: currency,
      status: 'confirmed',
      stripeSessionId: sessionId,
      stripePaymentIntentId: session.payment_intent,
      buyerId: user._id,
      totalPrice: amount_total / 100,
      purchaseDate: new Date(),
      createdAt: new Date(),
      
      customerInfo: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        ...customerInfo
      },
      
      shipping: {
        name: shipping.name || customerName,
        phone: shipping.phone || customerPhone,
        address: {
          line1: shippingAddress.line1 || '',
          line2: shippingAddress.line2 || '',
          city: shippingAddress.city || '',
          state: shippingAddress.state || '',
          postal_code: shippingAddress.postal_code || '',
          country: shippingAddress.country || ''
        }
      },
      
      timeline: [{
        status: 'confirmed',
        at: new Date(),
        note: 'Payment confirmed via Stripe'
      }],
      
      products: []
    };

    console.log('Creating order with data:', JSON.stringify(orderData, null, 2));

    // Create order in database
    const order = await Order.create(orderData);
    console.log('Order created successfully:', order._id);

    // Update product purchases
    console.log('=== UPDATING PRODUCT PURCHASES ===');
    console.log('Items to process:', items);
    
    for (const item of items) {
      try {
        console.log(`Looking for product with ID: ${item.id} (type: ${typeof item.id})`);
        const productDoc = await Product.findOne({ id: Number(item.id) });
        console.log(`Product found:`, productDoc ? `Yes - ${productDoc.name}` : 'No');
        
        if (productDoc) {
          console.log(`Updating product ${productDoc.name} purchases`);
          
          productDoc.purchases.push({
            userId: user._id.toString(),
            email: customerEmail,
            quantity: Number(item.quantity || 1),
            date: new Date(),
            deliveryAddress: {
              name: shipping.name || customerName,
              phone: shipping.phone || customerPhone,
              address: shippingAddress.line1 || '',
              city: shippingAddress.city || '',
              postalCode: shippingAddress.postal_code || '',
              country: shippingAddress.country || ''
            }
          });
          
          await productDoc.save();
          
          order.products.push({
            productId: productDoc._id,
            quantity: Number(item.quantity || 1)
          });
        }
      } catch (productError) {
        console.error(`Error updating product ${item.id}:`, productError);
      }
    }

    await order.save();
    console.log('Order updated with product references');

    // Send confirmation email
    try {
      console.log('=== SENDING EMAIL ===');
      console.log('Customer email:', customerEmail);
      console.log('SMTP config check:', {
        host: process.env.SMTP_HOST,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS ? 'SET' : 'NOT SET'
      });
      
      const itemsList = items.map(item => 
        `${item.name} x${item.quantity} - $${(Number(item.price || 0)).toFixed(2)}`
      ).join('\n');
      
      console.log('Items list for email:', itemsList);
      
      await sendOrderEmail(customerEmail, 'Order Confirmation - Shopdeshi', `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e91e63;">Thank you for your order!</h2>
          <p>Hi ${customerName},</p>
          <p>Your payment has been successfully processed.</p>
          
          <div style="background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Total:</strong> $${(amount_total / 100).toFixed(2)} ${currency.toUpperCase()}</p>
            <p><strong>Payment Method:</strong> Card ending in ${session.payment_method_types?.[0] || 'Card'}</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3>Items Ordered:</h3>
            <pre style="white-space: pre-wrap;">${itemsList}</pre>
          </div>
          
          ${shipping.address ? `
          <div style="background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3>Shipping Address:</h3>
            <p>${shipping.name || customerName}<br>
            ${shippingAddress.line1}<br>
            ${shippingAddress.line2 ? shippingAddress.line2 + '<br>' : ''}
            ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postal_code}<br>
            ${shippingAddress.country}</p>
          </div>
          ` : ''}
          
          <p>We'll send you tracking information once your order ships.</p>
          <p>Thank you for shopping with Shopdeshi!</p>
        </div>
      `);
      console.log('Confirmation email sent to:', customerEmail);
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
    }

    res.json({
      success: true,
      message: 'Payment verified and order created',
      order: order
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment: ' + error.message
    });
  }
});


// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running', timestamp: new Date().toISOString() });
});

// Start server
const serverPort = process.env.PORT || 4000;
app.listen(serverPort, (error) => {
  if (!error) {
    console.log(`Server running on port ${serverPort}`);
  } else {
    console.log("Error:", error);
  }
});

