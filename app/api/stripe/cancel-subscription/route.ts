export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })

  const { userToken } = await req.json()
  if (!userToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${userToken}` } } },
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_subscription_id')
    .eq('id', user.id)
    .maybeSingle()

  const subId = profile?.stripe_subscription_id
  if (!subId) return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })

  const stripe = new Stripe(stripeKey, { apiVersion: '2026-04-22.dahlia' })

  // Cancel at period end — user keeps access until billing cycle ends
  await stripe.subscriptions.update(subId, { cancel_at_period_end: true })

  // Update Supabase to reflect pending cancellation
  await supabase
    .from('profiles')
    .update({ subscription_status: 'cancelling' })
    .eq('id', user.id)

  return NextResponse.json({ success: true })
}
