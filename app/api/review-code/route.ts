import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const GROK_API_KEY = process.env.GROK_API_KEY || ''
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions'

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()
    if (!code || typeof code !== 'string' || code.trim().length < 5) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 })
    }

    const res = await axios.post(
      GROK_API_URL,
      {
        model: 'grok-2-1212',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert Arduino/electronics code reviewer for beginners. Be encouraging and educational. Return ONLY valid JSON, no markdown, no code blocks.',
          },
          {
            role: 'user',
            content: `Review this Arduino code. Return ONLY this JSON (no markdown):
{"summary":"what the code does in 1-2 plain sentences","issues":["issue 1","issue 2"],"improvements":["improvement 1","improvement 2"]}

Keep issues and improvements arrays to 2-4 items max. If the code is good, issues can be empty []. Be encouraging and specific.

Code to review:
\`\`\`
${code.slice(0, 3000)}
\`\`\``,
          },
        ],
        temperature: 0.4,
        max_tokens: 500,
      },
      { headers: { Authorization: `Bearer ${GROK_API_KEY}`, 'Content-Type': 'application/json' } }
    )

    const raw = res.data.choices[0].message.content as string
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)

    if (!parsed.summary || !Array.isArray(parsed.issues) || !Array.isArray(parsed.improvements)) {
      throw new Error('Invalid response structure')
    }

    return NextResponse.json(parsed)
  } catch (err) {
    console.error('review-code error:', err)
    return NextResponse.json({ error: 'Review failed — please try again' }, { status: 500 })
  }
}
