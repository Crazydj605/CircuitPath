// Server-side AI usage quotas — gates AI Tutor + Code Reviewer by tier.
// Quotas reset daily (UTC). Counts rows in ai_usage_log for the current UTC day.

import { createClient } from '@supabase/supabase-js'

export type Tier = 'free' | 'pro' | 'max'
export type AiKind = 'tutor' | 'review'

// Daily limits per tier. Infinity = no cap.
export const QUOTAS: Record<Tier, Record<AiKind, number>> = {
  free: { tutor: 5,        review: 3 },
  pro:  { tutor: 50,       review: Infinity },
  max:  { tutor: Infinity, review: Infinity },
}

// Vercel/Next runtime — service-role client used for quota counting + logging.
// Service role bypasses RLS so we can count rows reliably.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
})

function startOfUtcDayISO(): string {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString()
}

// Resolves the user from a Supabase access token (Bearer ...).
// Returns { userId, tier } or null if unauthenticated.
export async function getUserContext(
  accessToken: string | null
): Promise<{ userId: string; tier: Tier } | null> {
  if (!accessToken) return null

  const { data: userData, error } = await admin.auth.getUser(accessToken)
  if (error || !userData?.user) return null

  const userId = userData.user.id

  const { data: profile } = await admin
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .maybeSingle()

  const rawTier = (profile?.subscription_tier || 'free').toLowerCase()
  // Treat any legacy "premium" tier as Pro.
  const tier: Tier =
    rawTier === 'max' ? 'max' : rawTier === 'pro' || rawTier === 'premium' ? 'pro' : 'free'

  return { userId, tier }
}

export type QuotaCheck = {
  allowed: boolean
  tier: Tier
  used: number
  limit: number
  remaining: number
  resetAt: string // ISO timestamp when the daily window flips (next UTC midnight)
}

export async function checkQuota(userId: string, tier: Tier, kind: AiKind): Promise<QuotaCheck> {
  const limit = QUOTAS[tier][kind]
  const dayStart = startOfUtcDayISO()

  const nextReset = new Date(dayStart)
  nextReset.setUTCDate(nextReset.getUTCDate() + 1)

  if (limit === Infinity) {
    return { allowed: true, tier, used: 0, limit: Infinity, remaining: Infinity, resetAt: nextReset.toISOString() }
  }

  const { count } = await admin
    .from('ai_usage_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('kind', kind)
    .gte('created_at', dayStart)

  const used = count ?? 0
  return {
    allowed: used < limit,
    tier,
    used,
    limit,
    remaining: Math.max(0, limit - used),
    resetAt: nextReset.toISOString(),
  }
}

export async function logUsage(userId: string, kind: AiKind): Promise<void> {
  await admin.from('ai_usage_log').insert({ user_id: userId, kind })
}

// Extracts the bearer token from a Next.js request's Authorization header.
export function getBearerToken(req: Request): string | null {
  const header = req.headers.get('authorization') || req.headers.get('Authorization')
  if (!header) return null
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match ? match[1] : null
}
