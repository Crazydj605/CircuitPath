'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Suspense } from 'react'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')

    if (code) {
      // PKCE flow: Supabase sent a code, exchange it for a session
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        router.replace(error ? '/?auth_error=1' : '/dashboard')
      })
      return
    }

    // Implicit flow: tokens arrive in URL hash, Supabase processes automatically
    // Just wait for the session to appear
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { router.replace('/dashboard'); return }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) router.replace('/dashboard')
    })

    return () => subscription.unsubscribe()
  }, [router, searchParams])

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <p className="text-slate-500 text-sm">Signing you in...</p>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-slate-500 text-sm">Signing you in...</p>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  )
}
