// Centralised PostHog wrapper for CircuitPath.
//
// Initialised lazily on the client. Safe to call before init — events queue
// to a tiny in-memory buffer and flush once init completes. If the env var
// NEXT_PUBLIC_POSTHOG_KEY is not set, all calls become silent no-ops so the
// app still works locally / in dev without an analytics key.

'use client'

import posthog, { type PostHog } from 'posthog-js'

let initialised = false
let initialising = false
const pendingEvents: Array<{ event: string; props?: Record<string, unknown> }> = []

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

export function initAnalytics(): void {
  if (!isBrowser() || initialised || initialising) return
  if (!POSTHOG_KEY) {
    // No key configured — keep all calls as no-ops.
    initialised = true
    return
  }
  initialising = true
  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      person_profiles: 'identified_only',
      loaded: () => {
        initialised = true
        // Drain any events queued before init resolved.
        while (pendingEvents.length) {
          const e = pendingEvents.shift()!
          posthog.capture(e.event, e.props)
        }
      },
    })
  } catch {
    // PostHog can throw in restrictive browsers (private mode, CSP) —
    // swallow so the app keeps working.
    initialised = true
  }
}

export function identify(userId: string, props?: Record<string, unknown>): void {
  if (!isBrowser() || !POSTHOG_KEY) return
  try {
    posthog.identify(userId, props)
  } catch {}
}

export function resetIdentity(): void {
  if (!isBrowser() || !POSTHOG_KEY) return
  try {
    posthog.reset()
  } catch {}
}

export function track(event: string, props?: Record<string, unknown>): void {
  if (!isBrowser() || !POSTHOG_KEY) return
  if (!initialised) {
    pendingEvents.push({ event, props })
    return
  }
  try {
    posthog.capture(event, props)
  } catch {}
}

// Convenience wrappers for the named events we want to track from day one.
// Keeping them as functions (not constants) gives us call sites to grep for.
export const analytics = {
  signup: (method: 'email' | 'google' | 'other') => track('signup', { method }),
  lessonStart: (slug: string) => track('lesson_start', { slug }),
  lessonComplete: (slug: string, xp: number) => track('lesson_complete', { slug, xp }),
  quizPass: (slug: string, score: number) => track('quiz_pass', { slug, score }),
  quizFail: (slug: string, score: number) => track('quiz_fail', { slug, score }),
  dailyChallengeSubmit: (correct: boolean) => track('daily_challenge_submit', { correct }),
  weeklyChallengeSubmit: () => track('weekly_challenge_submit'),
  simulatorOpen: (source: string) => track('simulator_open', { source }),
  aiTutorMessage: (tier: string, remaining: number) =>
    track('ai_tutor_message', { tier, remaining }),
  codeReviewerSubmit: (tier: string) => track('code_reviewer_submit', { tier }),
  upgradeClicked: (tier: 'pro' | 'max', source: string) =>
    track('upgrade_clicked', { tier, source }),
  upgradeCompleted: (tier: 'pro' | 'max', billingCycle: 'monthly' | 'yearly') =>
    track('upgrade_completed', { tier, billing_cycle: billingCycle }),
  referralShare: (channel: string) => track('referral_share', { channel }),
  affiliateLinkClick: (product: string, url: string) =>
    track('affiliate_link_click', { product, url }),
  quotaBlocked: (kind: 'tutor' | 'review', tier: string) =>
    track('quota_blocked', { kind, tier }),
}

export type AnalyticsApi = typeof analytics
export type { PostHog }
