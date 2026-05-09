import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { projectId, userToken } = await req.json()
  if (!projectId || !userToken) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${userToken}` } } }
  )

  const { data: { user } } = await client.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Toggle vote
  const { data: existing } = await client
    .from('showcase_votes')
    .select('id')
    .eq('user_id', user.id)
    .eq('project_id', projectId)
    .maybeSingle()

  if (existing) {
    await client.from('showcase_votes').delete().eq('id', existing.id)
    return NextResponse.json({ voted: false })
  } else {
    await client.from('showcase_votes').insert({ user_id: user.id, project_id: projectId })
    return NextResponse.json({ voted: true })
  }
}
