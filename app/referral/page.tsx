'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Gift } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import ReferralWidget from '@/components/ReferralWidget'

export default function ReferralPage() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/')
    })
  }, [router])

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="bg-white border-b border-slate-200 px-4 py-8">
          <div className="max-w-xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <Gift className="w-7 h-7 text-violet-600" />
              <h1 className="text-2xl font-bold text-slate-900">Refer Friends</h1>
            </div>
            <p className="text-slate-500 text-sm ml-10">Share CircuitPath and both of you earn a free month of Pro.</p>
          </div>
        </div>

        <div className="max-w-xl mx-auto px-4 mt-8 space-y-5">
          <ReferralWidget />

          {/* How it works */}
          <div className="bg-white border border-slate-200 rounded-md p-5">
            <h3 className="font-semibold text-slate-900 text-sm mb-4">How it works</h3>
            <div className="space-y-3">
              {[
                { num: '1', text: 'Copy your referral link and share it with friends.' },
                { num: '2', text: 'When a friend signs up and enters your code, you both get 1 full month of Pro access free.' },
                { num: '3', text: 'There is no cap — every successful referral earns you another free month.' },
              ].map(s => (
                <div key={s.num} className="flex gap-3 items-start">
                  <span className="w-6 h-6 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{s.num}</span>
                  <p className="text-sm text-slate-600 pt-0.5">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
