import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from('showcase_projects')
    .select('*, votes:showcase_votes(count)')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const file = formData.get('file') as File
  const userToken = formData.get('userToken') as string

  if (!title || !file || !userToken) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const authedClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${userToken}` } } }
  )

  const { data: { user } } = await authedClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Upload image
  const ext = file.name.split('.').pop() || 'jpg'
  const fileName = `${user.id}/${Date.now()}.${ext}`
  const arrayBuffer = await file.arrayBuffer()

  const { data: uploadData, error: uploadError } = await authedClient.storage
    .from('project-photos')
    .upload(fileName, arrayBuffer, { contentType: file.type, upsert: false })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = authedClient.storage
    .from('project-photos')
    .getPublicUrl(fileName)

  const { data: project, error: insertError } = await authedClient
    .from('showcase_projects')
    .insert({ user_id: user.id, title, description: description || '', image_url: publicUrl })
    .select()
    .single()

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })
  return NextResponse.json(project)
}
