import { NextRequest, NextResponse } from 'next/server'
import { sendMessageToGrok } from '@/lib/grok'
import { checkQuota, getBearerToken, getUserContext, logUsage, QUOTAS } from '@/lib/quotas'

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json()
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const token = getBearerToken(req)
    const userCtx = await getUserContext(token)

    if (!userCtx) {
      return NextResponse.json(
        {
          error: 'Sign in to chat with the AI tutor.',
          requireAuth: true,
        },
        { status: 401 }
      )
    }

    const quota = await checkQuota(userCtx.userId, userCtx.tier, 'tutor')
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: `You hit the daily AI tutor limit (${quota.limit}/day on ${userCtx.tier}). Upgrade for more.`,
          quotaBlocked: true,
          tier: userCtx.tier,
          used: quota.used,
          limit: quota.limit,
          resetAt: quota.resetAt,
        },
        { status: 429 }
      )
    }

    const response = await sendMessageToGrok(message, context)

    // Only log usage on successful AI response so users aren't charged for outages.
    if (response.success) {
      await logUsage(userCtx.userId, 'tutor')
    }

    return NextResponse.json({
      ...response,
      quota: {
        tier: userCtx.tier,
        used: quota.used + 1,
        limit: quota.limit,
        remaining: Math.max(0, quota.limit - quota.used - 1),
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 })
  }
}

// GET returns the current quota state for the signed-in user.
// Lets the UI render "5 left today" without burning a request.
export async function GET(req: NextRequest) {
  const token = getBearerToken(req)
  const userCtx = await getUserContext(token)
  if (!userCtx) {
    return NextResponse.json({ tier: 'guest', limit: QUOTAS.free.tutor, used: 0, remaining: 0 })
  }
  const quota = await checkQuota(userCtx.userId, userCtx.tier, 'tutor')
  return NextResponse.json({
    tier: userCtx.tier,
    used: quota.used,
    limit: quota.limit,
    remaining: quota.remaining,
    resetAt: quota.resetAt,
  })
}
