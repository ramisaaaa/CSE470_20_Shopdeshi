const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendOrderEmail } = require('../utils/mailer');

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

let stripe = null;
if (STRIPE_SECRET_KEY) {
  try {
    const StripeLib = require('stripe');
    stripe = new StripeLib(STRIPE_SECRET_KEY);
  } catch (_) {}
}

exports.webhook = async (req, res) => {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) return res.status(500).send('Stripe not configured');
  let event;
  try {
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const existing = await Order.findOne({ stripeSessionId: session.id });
      if (existing) return res.json({ received: true, duplicate: true });

      const customerEmail = session.customer_details?.email || session.customer_email || 'unknown@example.com';
      const customerName = session.customer_details?.name || session.shipping?.name || 'Unknown Customer';
      const customerPhone = session.customer_details?.phone || session.shipping?.phone || '';
      const shipping = session.shipping_details || session.shipping || {};
      const shippingAddress = shipping.address || {};
      const amount_total = session.amount_total || 0;
      const currency = session.currency || 'usd';

      let items = []; let customerInfo = {};
      if (session.metadata) {
        try {
          if (session.metadata.items) items = JSON.parse(session.metadata.items);
          if (session.metadata.customerInfo) customerInfo = JSON.parse(session.metadata.customerInfo);
        } catch (_) {}
      }

      let user = await User.findOne({ email: customerEmail });
      if (!user) {
        user = await User.create({
          email: customerEmail,
          clerkId: `stripe_${session.id}_${Date.now()}`,
          firstName: customerName.split(' ')[0] || '',
          lastName: customerName.split(' ').slice(1).join(' ') || '',
          createdAt: new Date()
        });
      }

      const orderData = {
        email: customerEmail,
        items: items.map(item => ({ id: item.id || item.productId, name: item.name || 'Unknown Product', image: item.image || '', price: Number(item.price || item.new_price || 0), quantity: Number(item.quantity || 1) })),
        amount: amount_total,
        currency,
        status: 'confirmed',
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent,
        buyerId: user._id,
        totalPrice: amount_total / 100,
        purchaseDate: new Date(),
        createdAt: new Date(),
        customerInfo: { name: customerName, email: customerEmail, phone: customerPhone, ...customerInfo },
        shipping: { name: shipping.name || customerName, phone: shipping.phone || customerPhone, address: { line1: shippingAddress.line1 || '', line2: shippingAddress.line2 || '', city: shippingAddress.city || '', state: shippingAddress.state || '', postal_code: shippingAddress.postal_code || '', country: shippingAddress.country || '' } },
        timeline: [{ status: 'confirmed', at: new Date(), note: 'Payment confirmed via Stripe' }],
        products: []
      };

      const order = await Order.create(orderData);

      for (const item of items) {
        try {
          const productDoc = await Product.findOne({ id: Number(item.id) });
          if (productDoc) {
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
            order.products.push({ productId: productDoc._id, quantity: Number(item.quantity || 1) });
          }
        } catch (_) {}
      }
      await order.save();

      try {
        const itemsList = items.map(item => `${item.name} x${item.quantity} - $${(Number(item.price || 0)).toFixed(2)}`).join('\n');
        await sendOrderEmail(customerEmail, 'Order Confirmation - Shopdeshi', `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e91e63;">Thank you for your order!</h2>
            <p>Hi ${customerName},</p>
            <p>Your payment has been successfully processed.</p>
            <div style="background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <h3>Order Details:</h3>
              <p><strong>Total:</strong> $${(amount_total / 100).toFixed(2)} ${currency.toUpperCase()}</p>
            </div>
            <div style="background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <h3>Items Ordered:</h3>
              <pre style="white-space: pre-wrap;">${itemsList}</pre>
            </div>
          </div>
        `);
      } catch (_) {}
    }
    res.json({ received: true });
  } catch (error) {
    res.status(500).send('Webhook handler failed: ' + error.message);
  }
};

exports.createCheckoutSession = async (req, res) => {
  try {
    if (!stripe) return res.status(500).json({ success: false, message: 'Payment system not available' });
    const { items, customerInfo, successUrl, cancelUrl } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ success: false, message: 'No items provided' });
    if (!customerInfo?.email) return res.status(400).json({ success: false, message: 'Customer email is required' });

    const lineItems = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      let price = Number(item.price || item.new_price || 0);
      let quantity = Number(item.quantity || 1);
      if (price <= 0 || isNaN(price)) return res.status(400).json({ success: false, message: `Invalid price for item: ${item.name || 'Unknown item'}` });
      if (quantity <= 0 || isNaN(quantity)) return res.status(400).json({ success: false, message: `Invalid quantity for item: ${item.name || 'Unknown item'}` });
      let imageUrl = null;
      if (item.image) {
        if (typeof item.image === 'string') imageUrl = item.image; else if (typeof item.image === 'object' && item.image.src) imageUrl = item.image.src;
        if (imageUrl && !imageUrl.startsWith('http')) imageUrl = `${req.protocol}://${req.get('host')}${imageUrl}`;
      }
      lineItems.push({
        price_data: { currency: 'usd', product_data: { name: String(item.name || `Product ${item.id || i + 1}`), ...(imageUrl && typeof imageUrl === 'string' ? { images: [imageUrl] } : {}) }, unit_amount: Math.round(price * 100) },
        quantity
      });
    }
    const cleanItems = items.map(item => ({ id: item.id, name: item.name, price: Number(item.price || item.new_price || 0), quantity: Number(item.quantity || 1), image: typeof item.image === 'string' ? item.image : (typeof item.image === 'object' && item.image?.src ? item.image.src : '') }));
    const sessionData = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: (successUrl && successUrl.includes('{CHECKOUT_SESSION_ID}')) ? successUrl : `${(successUrl || 'http://localhost:3000/success_payment')}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `http://localhost:3000/cart`,
      customer_email: customerInfo.email,
      metadata: { items: JSON.stringify(cleanItems), customerInfo: JSON.stringify(customerInfo) },
      shipping_address_collection: { allowed_countries: ['US','CA','GB','AU','BD','IN','DE','FR'] },
    };
    const session = await stripe.checkout.sessions.create(sessionData);
    res.json({ success: true, url: session.url, sessionId: session.id });
  } catch (error) {
    let errorMessage = 'Internal server error during checkout'; let statusCode = 500;
    if (error.type?.includes('Stripe')) { errorMessage = `Payment error: ${error.message}`; statusCode = 400; }
    else if (error.message?.includes('Invalid')) { errorMessage = error.message; statusCode = 400; }
    res.status(statusCode).json({ success: false, message: errorMessage, details: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, message: 'Session ID is required' });
    if (!stripe) return res.status(500).json({ success: false, message: 'Stripe not configured' });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const existing = await Order.findOne({ stripeSessionId: sessionId });
    if (existing) return res.json({ success: true, message: 'Order already exists for this session', order: existing });
    if (session.payment_status !== 'paid') return res.status(400).json({ success: false, message: 'Payment not completed' });

    const customerEmail = session.customer_details?.email || session.customer_email || 'unknown@example.com';
    const customerName = session.customer_details?.name || session.shipping?.name || 'Unknown Customer';
    const customerPhone = session.customer_details?.phone || session.shipping?.phone || '';
    const shipping = session.shipping_details || session.shipping || {};
    const shippingAddress = shipping.address || {};
    const amount_total = session.amount_total || 0;
    const currency = session.currency || 'usd';

    let items = []; let customerInfo = {};
    if (session.metadata) {
      try { if (session.metadata.items) items = JSON.parse(session.metadata.items); if (session.metadata.customerInfo) customerInfo = JSON.parse(session.metadata.customerInfo); } catch (_) {}
    }

    let user = await User.findOne({ email: customerEmail });
    if (!user) {
      user = await User.create({
        email: customerEmail,
        clerkId: `stripe_${sessionId}_${Date.now()}`,
        firstName: customerName.split(' ')[0] || '',
        lastName: customerName.split(' ').slice(1).join(' ') || '',
        createdAt: new Date()
      });
    }

    const orderData = {
      email: customerEmail,
      items: items.map(item => ({ id: item.id || item.productId, name: item.name || 'Unknown Product', image: item.image || '', price: Number(item.price || item.new_price || 0), quantity: Number(item.quantity || 1) })),
      amount: amount_total,
      currency,
      status: 'confirmed',
      stripeSessionId: sessionId,
      stripePaymentIntentId: session.payment_intent,
      buyerId: user._id,
      totalPrice: amount_total / 100,
      purchaseDate: new Date(),
      createdAt: new Date(),
      customerInfo: { name: customerName, email: customerEmail, phone: customerPhone, ...customerInfo },
      shipping: { name: shipping.name || customerName, phone: shipping.phone || customerPhone, address: { line1: shippingAddress.line1 || '', line2: shippingAddress.line2 || '', city: shippingAddress.city || '', state: shippingAddress.state || '', postal_code: shippingAddress.postal_code || '', country: shippingAddress.country || '' } },
      timeline: [{ status: 'confirmed', at: new Date(), note: 'Payment confirmed via Stripe' }],
      products: []
    };

    const order = await Order.create(orderData);

    for (const item of items) {
      try {
        const productDoc = await Product.findOne({ id: Number(item.id) });
        if (productDoc) {
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
          order.products.push({ productId: productDoc._id, quantity: Number(item.quantity || 1) });
        }
      } catch (_) {}
    }
    await order.save();

    try {
      const itemsList = items.map(item => `${item.name} x${item.quantity} - $${(Number(item.price || 0)).toFixed(2)}`).join('\n');
      await sendOrderEmail(customerEmail, 'Order Confirmation - Shopdeshi', `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e91e63;">Thank you for your order!</h2>
          <p>Hi ${customerName},</p>
          <p>Your payment has been successfully processed.</p>
          <div style=\"background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;\">
            <h3>Order Details:</h3>
            <p><strong>Total:</strong> $${(amount_total / 100).toFixed(2)} ${currency.toUpperCase()}</p>
          </div>
          <div style=\"background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px;\">
            <h3>Items Ordered:</h3>
            <pre style=\"white-space: pre-wrap;\">${itemsList}</pre>
          </div>
        </div>
      `);
    } catch (_) {}

    res.json({ success: true, message: 'Payment verified and order created', order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error verifying payment: ' + error.message });
  }
};


