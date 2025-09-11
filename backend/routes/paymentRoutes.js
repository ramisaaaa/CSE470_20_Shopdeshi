const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paymentController');

// Stripe webhook must use raw body; mount JSON in app.js skip for this path
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), ctrl.webhook);

router.post('/api/create-checkout-session', ctrl.createCheckoutSession);
router.post('/api/verify-payment', ctrl.verifyPayment);

module.exports = router;


