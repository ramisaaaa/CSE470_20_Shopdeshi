import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  // For demo: get cart from localStorage is not possible server-side, so expect cart as JSON string in a hidden input
  const cartRaw = formData.get('cart');
  let cart: any[] = [];
  try {
    cart = JSON.parse(cartRaw as string);
  } catch {}

  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
  }

  const line_items = cart.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
        images: [item.image],
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items,
    mode: 'payment',
    success_url: `${req.nextUrl.origin}/cart?success=1`,
    cancel_url: `${req.nextUrl.origin}/cart?canceled=1`,
  });

  return NextResponse.redirect(session.url!);
} 