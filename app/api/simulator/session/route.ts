// Logs a simulator session and enforces per-day caps by tier.
// Free: 3 sessions/day. Pro/Max: unlimited.

import { NextRequest, NextResponse } from 'next/server'
import { getBearerToken, getUserContext } from '@/lib/quotas'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const admin = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })

const FREE_DAILY_LIMIT = 3

function startOfUtcDayISO(): string {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString()
}

export async function GET(req: NextRequest) {
  const token = getBearerToken(req)
  const userCtx = await getUserContext(token)
  if (!userCtx) {
    return NextResponse.json({ tier: 'guest', used: 0, limit: FREE_DAILY_LIMIT, remaining: 0, allowed: false })
  }

  if (userCtx.tier !== 'free') {
    return NextResponse.json({
      tier: userCtx.tier,
      used: 0,
      limit: Infinity,
      remaining: Infinity,
      allowed: true,
    })
  }

  const { count } = await admin
    .from('simulator_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userCtx.userId)
    .gte('created_at', startOfUtcDayISO())

  const used = count ?? 0
  return NextResponse.json({
    tier: userCtx.tier,
    used,
    limit: FREE_DAILY_LIMIT,
    remaining: Math.max(0, FREE_DAILY_LIMIT - used),
    allowed: used < FREE_DAILY_LIMIT,
  })
}

export async function POST(req: NextRequest) {
  const token = getBearerToken(req)
  const userCtx = await getUserContext(token)
  if (!userCtx) {
    return NextResponse.json({ error: 'Sign in to use the simulator.', requireAuth: true }, { status: 401 })
  }

  if (userCtx.tier === 'free') {
    const { count } = await admin
      .from('simulator_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userCtx.userId)
      .gte('created_at', startOfUtcDayISO())
    if ((count ?? 0) >= FREE_DAILY_LIMIT) {
      return NextResponse.json(
        {
          error: `Free plan is limited to ${FREE_DAILY_LIMIT} simulator sessions per day. Upgrade to Pro for unlimited.`,
          quotaBlocked: true,
          tier: 'free',
          used: count,
          limit: FREE_DAILY_LIMIT,
        },
        { status: 429 }
      )
    }
  }

  await admin.from('simulator_sessions').insert({ user_id: userCtx.userId })

  return NextResponse.json({ ok: true, tier: userCtx.tier })
}
