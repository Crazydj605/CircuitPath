export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2026-04-22.dahlia' })
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const db = supabaseAdmin()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const type = session.metadata?.type

    if (type === 'certificate') {
      const userId = session.metadata?.user_id
      const lessonSlug = session.metadata?.lesson_slug
      const recipientName = session.metadata?.recipient_name
      if (userId && lessonSlug && recipientName) {
        await db.from('certificates').upsert(
          { user_id: userId, lesson_slug: lessonSlug, recipient_name: recipientName },
          { onConflict: 'user_id,lesson_slug' },
        )
      }
    } else {
      const userId = session.metadata?.user_id
      const tier = session.metadata?.tier
      if (userId && tier) {
        await db.from('profiles').update({
          subscription_tier: tier,
          subscription_status: 'active',
          stripe_subscription_id: session.subscription,
        }).eq('id', userId)
      }
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object
    const customerId = sub.customer
    const status = sub.status
    const productId: string | undefined = sub.items?.data?.[0]?.price?.product

    let tier = 'free'
    if (productId && productId === process.env.STRIPE_PRODUCT_MAX) tier = 'max'
    else if (productId && productId === process.env.STRIPE_PRODUCT_PRO) tier = 'pro'

    await db.from('profiles').update({
      subscription_tier: status === 'active' ? tier : 'free',
      subscription_status: status,
      stripe_subscription_id: sub.id,
    }).eq('stripe_customer_id', customerId)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object
    await db.from('profiles').update({
      subscription_tier: 'free',
      subscription_status: 'canceled',
    }).eq('stripe_customer_id', sub.customer)
  }

  return NextResponse.json({ received: true })
}
