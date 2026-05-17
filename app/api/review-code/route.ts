import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { checkQuota, getBearerToken, getUserContext, logUsage, QUOTAS } from '@/lib/quotas'

const GROK_API_KEY = process.env.GROK_API_KEY || ''
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions'

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()
    if (!code || typeof code !== 'string' || code.trim().length < 5) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 })
    }

    const token = getBearerToken(req)
    const userCtx = await getUserContext(token)

    if (!userCtx) {
      return NextResponse.json(
        { error: 'Sign in to review code.', requireAuth: true },
        { status: 401 }
      )
    }

    const quota = await checkQuota(userCtx.userId, userCtx.tier, 'review')
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: `You hit the daily code-review limit (${quota.limit}/day on ${userCtx.tier}). Upgrade for unlimited.`,
          quotaBlocked: true,
          tier: userCtx.tier,
          used: quota.used,
          limit: quota.limit,
          resetAt: quota.resetAt,
        },
        { status: 429 }
      )
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

    await logUsage(userCtx.userId, 'review')

    return NextResponse.json({
      ...parsed,
      quota: {
        tier: userCtx.tier,
        used: quota.used + 1,
        limit: quota.limit,
        remaining: Math.max(0, quota.limit - quota.used - 1),
      },
    })
  } catch (err) {
    console.error('review-code error:', err)
    return NextResponse.json({ error: 'Review failed — please try again' }, { status: 500 })
  }
}

// GET returns the current quota state so UI can show "3 left today".
export async function GET(req: NextRequest) {
  const token = getBearerToken(req)
  const userCtx = await getUserContext(token)
  if (!userCtx) {
    return NextResponse.json({ tier: 'guest', limit: QUOTAS.free.review, used: 0, remaining: 0 })
  }
  const quota = await checkQuota(userCtx.userId, userCtx.tier, 'review')
  return NextResponse.json({
    tier: userCtx.tier,
    used: quota.used,
    limit: quota.limit,
    remaining: quota.remaining,
    resetAt: quota.resetAt,
  })
}
