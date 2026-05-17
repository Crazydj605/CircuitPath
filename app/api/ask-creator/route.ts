export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { subject, question, userToken } = await req.json()
  if (!userToken) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  if (!subject?.trim() || !question?.trim()) return NextResponse.json({ error: 'Subject and question are required' }, { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${userToken}` } } },
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Only Max users
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.subscription_tier !== 'max' && profile?.subscription_tier !== 'premium') {
    return NextResponse.json({ error: 'Max plan required' }, { status: 403 })
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { error } = await adminClient.from('creator_questions').insert({
    user_id: user.id,
    user_email: user.email,
    subject: subject.trim(),
    question: question.trim(),
  })

  if (error) return NextResponse.json({ error: 'Failed to save — please try again.' }, { status: 500 })

  return NextResponse.json({ success: true })
}
