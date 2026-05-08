'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(() => {
        router.replace('/dashboard')
      })
    } else {
      router.replace('/')
    }
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
        <p className="text-slate-500 text-sm">Loading...</p>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  )
}
