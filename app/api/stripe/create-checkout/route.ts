export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const PRICE_IDS: Record<string, Record<string, string | undefined>> = {
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
  },
  max: {
    monthly: process.env.STRIPE_PRICE_MAX_MONTHLY,
    yearly: process.env.STRIPE_PRICE_MAX_YEARLY,
  },
}

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) return NextResponse.json({ error: 'Stripe not configured — add STRIPE_SECRET_KEY env var' }, { status: 503 })

  const { tier, billingCycle, userToken } = await req.json()
  if (!userToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${userToken}` } } },
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cycle: 'monthly' | 'yearly' = billingCycle === 'yearly' ? 'yearly' : 'monthly'
  const priceId = PRICE_IDS[tier]?.[cycle]
  if (!priceId) return NextResponse.json({ error: 'Price not configured — add STRIPE_PRICE_* env vars in Vercel' }, { status: 503 })

  const stripe = new Stripe(stripeKey, { apiVersion: '2026-04-22.dahlia' })

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .maybeSingle()

  let customerId = profile?.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_uid: user.id },
    })
    customerId = customer.id
    await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://circuitpath.net'
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard?upgraded=1`,
    cancel_url: `${baseUrl}/pricing`,
    metadata: { user_id: user.id, tier },
  })

  return NextResponse.json({ url: session.url })
}
