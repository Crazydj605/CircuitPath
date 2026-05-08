'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Suspense } from 'react'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Processing...')

  useEffect(() => {
    async function handleCallback() {
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')
      const code = searchParams.get('code')

      // OAuth returned an error
      if (error) {
        setStatus(`Error: ${errorDescription || error}`)
        setTimeout(() => router.replace('/'), 3000)
        return
      }

      // PKCE flow: exchange the code
      if (code) {
        setStatus('Exchanging code...')
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          setStatus('Exchange failed, checking session...')
        }
      }

      // Check if session already exists (covers both PKCE success and implicit flow)
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace('/dashboard')
        return
      }

      // Implicit flow: tokens may be in the URL hash — parse manually
      const hash = window.location.hash.substring(1)
      const hashParams = new URLSearchParams(hash)
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      if (accessToken) {
        setStatus('Setting session from token...')
        const { error: setError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken ?? '',
        })
        if (!setError) {
          router.replace('/dashboard')
          return
        }
      }

      // Last resort: wait for onAuthStateChange
      setStatus('Waiting for auth...')
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
        if (sess) router.replace('/dashboard')
      })

      // Timeout fallback — if nothing happens in 8s, go home
      const timer = setTimeout(() => {
        subscription.unsubscribe()
        router.replace('/')
      }, 8000)

      return () => {
        subscription.unsubscribe()
        clearTimeout(timer)
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-3">
      <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
      <p className="text-slate-500 text-sm">{status}</p>
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
