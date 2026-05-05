export const dynamic = "force-dynamic"; // ⬅️ prevents Netlify from running this at build time

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY

    // Prevent build-time crashes
    if (!secret) {
      console.error("❌ Missing STRIPE_SECRET_KEY in environment")
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      )
    }

    const stripe = new Stripe(secret, {
      apiVersion: '2026-04-22.dahlia',
    })

    const { priceId, userId } = await req.json()

    if (!priceId || !userId) {
      return NextResponse.json(
        { error: 'Price ID and User ID are required' },
        { status: 400 }
      )
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        userId,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
