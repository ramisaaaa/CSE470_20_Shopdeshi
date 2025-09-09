import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set. Checkout will fail until it is configured.');
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })
  : (null as unknown as Stripe);

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured. Set STRIPE_SECRET_KEY in .env.local and restart the dev server.' }, { status: 500 });
    }

    const contentType = req.headers.get('content-type') || '';
    let cart: any[] = [];
    let email: string | undefined;

    if (contentType.includes('application/json')) {
      const body = await req.json();
      cart = Array.isArray(body?.cart) ? body.cart : [];
      email = body?.email;
    } else {
      const formData = await req.formData();
      const cartRaw = formData.get('cart');
      
      // Improved cart parsing with error handling
      if (cartRaw && typeof cartRaw === 'string') {
        try {
          cart = JSON.parse(cartRaw);
          if (!Array.isArray(cart)) {
            cart = [];
          }
        } catch (parseError) {
          console.error('Error parsing cart:', parseError);
          cart = [];
        }
      }
      
      email = (formData.get('email') as string) || undefined;
    }

    // Validate cart
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Validate and format line items
    const line_items = cart.map((item) => {
      // Ensure price is a number and convert to cents
      const unit_amount = Math.round(Number(item.price || 0) * 100);
      
      // Validate price
      if (isNaN(unit_amount) || unit_amount <= 0) {
        throw new Error(`Invalid price for item: ${item.name}`);
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name || 'Unnamed Product',
            images: item.image ? [item.image] : [],
          },
          unit_amount: unit_amount,
        },
        quantity: Math.max(1, Number(item.quantity || 1)),
      };
    });

    // Prepare metadata items
    const metaItems = cart.map((item: any) => ({
      id: item.id || 'unknown',
      q: Math.max(1, Number(item.quantity || 1)),
      p: Number(item.price || 0),
      n: (item.name || 'Unknown Product').slice(0, 40)
    }));

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: email,
      success_url: `${req.nextUrl.origin}/cart?success=1`,
      cancel_url: `${req.nextUrl.origin}/cart?canceled=1`,
      metadata: { 
        items: JSON.stringify(metaItems),
        email: email || 'unknown@email.com'
      },
      shipping_address_collection: { 
        allowed_countries: ['US', 'CA', 'GB', 'BD', 'IN', 'AU', 'DE', 'FR'] 
      },
      phone_number_collection: { enabled: true },
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error('Checkout error:', e);
    return NextResponse.json({ 
      error: e?.message || 'Checkout failed',
      details: e?.type || 'Unknown error' 
    }, { status: 500 });
  }
}