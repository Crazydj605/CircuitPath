export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const CERT_PRICES: Record<string, number> = {
  free: 499,
  pro: 199,
}

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })

  const { lessonSlug, recipientName, userToken } = await req.json()
  if (!userToken || !lessonSlug || !recipientName?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${userToken}` } } },
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, stripe_customer_id')
    .eq('id', user.id)
    .maybeSingle()

  const tier = profile?.subscription_tier || 'free'
  if (tier === 'max') return NextResponse.json({ error: 'Max users get certificates free' }, { status: 400 })

  const priceInCents = CERT_PRICES[tier] ?? CERT_PRICES.free
  const stripe = new Stripe(stripeKey, { apiVersion: '2026-04-22.dahlia' })

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
    mode: 'payment',
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{
      quantity: 1,
      price_data: {
        currency: 'usd',
        unit_amount: priceInCents,
        product_data: {
          name: 'CircuitPath Certificate',
          description: `Certificate of Completion — ${recipientName.trim()}`,
        },
      },
    }],
    success_url: `${baseUrl}/certificates?paid=1`,
    cancel_url: `${baseUrl}/certificates`,
    metadata: {
      user_id: user.id,
      lesson_slug: lessonSlug,
      recipient_name: recipientName.trim(),
      type: 'certificate',
    },
  })

  return NextResponse.json({ url: session.url })
}
