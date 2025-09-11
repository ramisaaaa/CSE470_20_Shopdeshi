require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { connectDb } = require('./config/db');

// Routes
const uploadRoutes = require('./routes/uploadRoutes');
const productRoutes = require('./routes/productRoutes');
const tutorialRoutes = require('./routes/tutorialRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

// DB
connectDb();

// CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Stripe webhook requires raw body. Mount it before JSON middleware inside routes module.
// JSON middleware for all other routes
app.use((req, res, next) => {
  if (req.originalUrl === '/stripe/webhook') return next();
  return express.json()(req, res, next);
});

// Static files for uploads
app.use('/images', express.static(path.join(__dirname, 'upload/images')));

// Mount routes
app.use(uploadRoutes);
app.use(productRoutes);
app.use(tutorialRoutes);
app.use(userRoutes);
app.use(orderRoutes);
app.use(complaintRoutes);
app.use(reviewRoutes);
app.use(paymentRoutes);
app.use(healthRoutes);

// Root
app.get('/', (_req, res) => {
  res.send('Express app is running');
});

module.exports = app;


