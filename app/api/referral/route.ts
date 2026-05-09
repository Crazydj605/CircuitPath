export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function randomCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export async function GET(req: NextRequest) {
  const userToken = req.headers.get('authorization')?.replace('Bearer ', '')
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
    .select('referral_code, referral_bonus_weeks')
    .eq('id', user.id)
    .maybeSingle()

  let code = profile?.referral_code
  if (!code) {
    // Generate a unique code
    code = randomCode()
    // Retry until unique (collision is extremely rare with 8-char codes)
    const { error } = await supabase.from('profiles').update({ referral_code: code }).eq('id', user.id)
    if (error) {
      code = randomCode() + randomCode().slice(0, 2)
      await supabase.from('profiles').update({ referral_code: code }).eq('id', user.id)
    }
  }

  // Count how many users were referred by this code
  const { count } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('referred_by', code)

  return NextResponse.json({
    referral_code: code,
    referral_count: count ?? 0,
    bonus_weeks: Math.min(profile?.referral_bonus_weeks ?? 0, 2),
  })
}

export async function POST(req: NextRequest) {
  const { referral_code, userToken } = await req.json()
  if (!referral_code || !userToken) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${userToken}` } } },
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: referee } = await supabase
    .from('profiles')
    .select('referred_by')
    .eq('id', user.id)
    .maybeSingle()

  if (referee?.referred_by) return NextResponse.json({ error: 'Already used a referral code' }, { status: 400 })

  // Find the referrer
  const { data: referrer } = await supabase
    .from('profiles')
    .select('id, referral_bonus_weeks, referral_code')
    .eq('referral_code', referral_code.toUpperCase())
    .maybeSingle()

  if (!referrer) return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 })
  if (referrer.id === user.id) return NextResponse.json({ error: "Can't use your own code" }, { status: 400 })
  if ((referrer.referral_bonus_weeks ?? 0) >= 2) return NextResponse.json({ error: 'Referrer has reached the 2-referral cap' }, { status: 400 })

  // Mark the referee as referred + give them a bonus week
  await supabase.from('profiles').update({ referred_by: referral_code.toUpperCase(), referral_bonus_weeks: 1 }).eq('id', user.id)
  // Give the referrer a bonus week (capped at 2)
  await supabase.from('profiles').update({ referral_bonus_weeks: (referrer.referral_bonus_weeks ?? 0) + 1 }).eq('id', referrer.id)

  return NextResponse.json({ success: true, message: 'Both you and the referrer earned 1 week of Pro!' })
}
