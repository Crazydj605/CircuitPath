'use client'

import { useEffect } from 'react'
import { initAnalytics, identify, resetIdentity } from '@/lib/analytics'
import { supabase } from '@/lib/supabase'

// Mounted once in app/layout.tsx. Initialises PostHog and keeps the
// identified user in sync with Supabase auth changes.
export default function AnalyticsBootstrap() {
  useEffect(() => {
    initAnalytics()

    // Identify the currently signed-in user (if any) on mount.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        identify(session.user.id, {
          email: session.user.email,
        })
      }
    })

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        resetIdentity()
      } else if (session.user) {
        identify(session.user.id, { email: session.user.email })
      }
    })

    return () => {
      sub?.subscription?.unsubscribe()
    }
  }, [])

  return null
}
