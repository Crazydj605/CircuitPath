import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const GROK_API_KEY = process.env.GROK_API_KEY || ''
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions'

function getWeekKey(): string {
  const now = new Date()
  const year = now.getFullYear()
  const startOfYear = new Date(year, 0, 1)
  const diff = now.getTime() - startOfYear.getTime()
  const week = Math.ceil((diff / 86400000 + startOfYear.getDay() + 1) / 7)
  return `${year}-W${String(week).padStart(2, '0')}`
}

const FALLBACK_CHALLENGE = {
  title: 'Traffic Light Controller',
  description: 'Build a traffic light system using 3 LEDs (red, yellow, green). The lights should cycle automatically — green for 4 seconds, yellow for 1 second, red for 3 seconds. Share a photo of your setup!',
  hints: [
    'Use three separate digital pins for each LED',
    'Use digitalWrite() and delay() to control the timing',
    'Put your LEDs in a row on a breadboard to mimic a real traffic light',
  ],
  difficulty: 'beginner',
}

async function generateChallenge(): Promise<typeof FALLBACK_CHALLENGE> {
  try {
    const res = await axios.post(
      GROK_API_URL,
      {
        model: 'grok-2-1212',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Arduino educator creating weekly build challenges for beginners. Return ONLY valid JSON, no markdown.',
          },
          {
            role: 'user',
            content: `Generate a fun, achievable Arduino build challenge for beginners. Return ONLY this JSON:
{"title":"short catchy title","description":"2-3 sentence challenge description explaining what to build and what it should do","hints":["hint 1","hint 2","hint 3"],"difficulty":"beginner"}

The challenge should use common components (LEDs, buttons, resistors, servo, buzzer, potentiometer).
Make it creative and rewarding to build. No soldering required.`,
          },
        ],
        temperature: 0.8,
        max_tokens: 400,
      },
      { headers: { Authorization: `Bearer ${GROK_API_KEY}`, 'Content-Type': 'application/json' } }
    )
    const raw = res.data.choices[0].message.content as string
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)
    if (!parsed.title || !parsed.description || !Array.isArray(parsed.hints)) throw new Error('bad shape')
    return parsed
  } catch {
    return FALLBACK_CHALLENGE
  }
}

export async function GET() {
  try {
    const weekKey = getWeekKey()

    // Check for existing challenge this week
    const existing = await axios.get(
      `${SUPABASE_URL}/rest/v1/weekly_challenges?week_key=eq.${weekKey}&select=*&limit=1`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    )

    if (existing.data && existing.data.length > 0) {
      return NextResponse.json(existing.data[0])
    }

    // Generate new challenge
    const challenge = await generateChallenge()

    const insert = await axios.post(
      `${SUPABASE_URL}/rest/v1/weekly_challenges`,
      { week_key: weekKey, ...challenge },
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
      }
    )

    return NextResponse.json(insert.data[0] || { week_key: weekKey, ...challenge })
  } catch (err) {
    console.error('weekly-challenge GET error:', err)
    return NextResponse.json({ ...FALLBACK_CHALLENGE, week_key: getWeekKey() })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { challengeId, description, userToken } = await req.json()
    if (!challengeId || !description || !userToken) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const res = await axios.post(
      `${SUPABASE_URL}/rest/v1/weekly_challenge_submissions`,
      { challenge_id: challengeId, description },
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
      }
    )

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    const msg = err?.response?.data?.message || 'Submit failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
