export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

  // Get completed lessons with their details
  const { data: progress } = await supabase
    .from('learning_user_lesson_progress')
    .select('lesson_id, completed_at, learning_lessons(slug, title)')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })

  // Get already-issued certificates
  const { data: certs } = await supabase
    .from('certificates')
    .select('lesson_slug, recipient_name, issued_at')
    .eq('user_id', user.id)

  const issuedMap = new Map((certs || []).map(c => [c.lesson_slug, c]))

  const completedLessons = (progress || []).map((p: any) => ({
    lesson_id: p.lesson_id,
    slug: p.learning_lessons?.slug,
    title: p.learning_lessons?.title,
    completed_at: p.completed_at,
    certificate: issuedMap.get(p.learning_lessons?.slug) || null,
  })).filter(l => l.slug)

  return NextResponse.json({ completed_lessons: completedLessons })
}

export async function POST(req: NextRequest) {
  const { lesson_slug, recipient_name, userToken } = await req.json()
  if (!lesson_slug || !recipient_name || !userToken) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${userToken}` } } },
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check the user actually completed this lesson
  const { data: prog } = await supabase
    .from('learning_user_lesson_progress')
    .select('lesson_id, learning_lessons(slug)')
    .eq('user_id', user.id)
    .eq('status', 'completed')

  const completedSlugs = (prog || []).map((p: any) => p.learning_lessons?.slug).filter(Boolean)
  if (!completedSlugs.includes(lesson_slug)) {
    return NextResponse.json({ error: 'Lesson not completed' }, { status: 403 })
  }

  // Check if cert already issued
  const { data: existing } = await supabase
    .from('certificates')
    .select('id, recipient_name, issued_at')
    .eq('user_id', user.id)
    .eq('lesson_slug', lesson_slug)
    .maybeSingle()

  if (existing) return NextResponse.json(existing)

  // Check subscription tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .maybeSingle()

  const tier = profile?.subscription_tier || 'free'
  if (tier !== 'max') {
    return NextResponse.json({ error: 'upgrade_required', tier }, { status: 402 })
  }

  const { data: cert } = await supabase
    .from('certificates')
    .insert({ user_id: user.id, lesson_slug, recipient_name: recipient_name.trim() })
    .select()
    .single()

  return NextResponse.json(cert)
}
