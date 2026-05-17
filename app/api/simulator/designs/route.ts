// Save / list / delete a user's saved simulator designs.
// Free: cannot save. Pro: up to 10 designs. Max: unlimited.

import { NextRequest, NextResponse } from 'next/server'
import { getBearerToken, getUserContext } from '@/lib/quotas'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const admin = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })

const PRO_SAVE_LIMIT = 10

export async function GET(req: NextRequest) {
  const token = getBearerToken(req)
  const userCtx = await getUserContext(token)
  if (!userCtx) return NextResponse.json({ designs: [], tier: 'guest' })

  const { data, error } = await admin
    .from('simulator_designs')
    .select('id, name, wokwi_url, notes, created_at, updated_at')
    .eq('user_id', userCtx.userId)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const saveLimit = userCtx.tier === 'max' ? Infinity : userCtx.tier === 'pro' ? PRO_SAVE_LIMIT : 0
  return NextResponse.json({
    designs: data ?? [],
    tier: userCtx.tier,
    saveLimit,
    canSave: (data?.length ?? 0) < saveLimit,
  })
}

export async function POST(req: NextRequest) {
  const token = getBearerToken(req)
  const userCtx = await getUserContext(token)
  if (!userCtx) {
    return NextResponse.json({ error: 'Sign in to save designs.', requireAuth: true }, { status: 401 })
  }
  if (userCtx.tier === 'free') {
    return NextResponse.json(
      { error: 'Saving designs is a Pro feature. Upgrade to save your work.', quotaBlocked: true, tier: 'free' },
      { status: 403 }
    )
  }

  const { name, wokwi_url, notes } = await req.json()
  if (!name || !wokwi_url) {
    return NextResponse.json({ error: 'name and wokwi_url are required' }, { status: 400 })
  }

  // Enforce Pro's 10-design cap.
  if (userCtx.tier === 'pro') {
    const { count } = await admin
      .from('simulator_designs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userCtx.userId)
    if ((count ?? 0) >= PRO_SAVE_LIMIT) {
      return NextResponse.json(
        {
          error: `Pro tier saves up to ${PRO_SAVE_LIMIT} designs. Delete one or upgrade to Max for unlimited.`,
          quotaBlocked: true,
          tier: 'pro',
        },
        { status: 429 }
      )
    }
  }

  const { data, error } = await admin
    .from('simulator_designs')
    .insert({ user_id: userCtx.userId, name, wokwi_url, notes })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ design: data })
}

export async function DELETE(req: NextRequest) {
  const token = getBearerToken(req)
  const userCtx = await getUserContext(token)
  if (!userCtx) return NextResponse.json({ error: 'auth' }, { status: 401 })

  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await admin.from('simulator_designs').delete().eq('id', id).eq('user_id', userCtx.userId)
  return NextResponse.json({ ok: true })
}
