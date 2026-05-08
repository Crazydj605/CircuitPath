'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    // With implicit flow, Supabase processes the #access_token hash automatically
    // and fires onAuthStateChange. We just wait for the session to appear.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { router.replace('/dashboard'); return }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) router.replace('/dashboard')
    })

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <p className="text-slate-500 text-sm">Signing you in...</p>
    </div>
  )
}
