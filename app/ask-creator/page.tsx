'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Lock, Send } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

export default function AskCreator() {
  const router = useRouter()
  const [userTier, setUserTier] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [subject, setSubject] = useState('')
  const [question, setQuestion] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/'); return }
      const { data: profile } = await supabase.from('profiles').select('subscription_tier').eq('id', session.user.id).maybeSingle()
      setUserTier(profile?.subscription_tier || 'free')
      setLoading(false)
    })
  }, [router])

  const handleSubmit = async () => {
    if (!subject.trim() || !question.trim() || status === 'sending') return
    setStatus('sending')
    setErrorMsg('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setStatus('error'); setErrorMsg('Not logged in'); return }
    const res = await fetch('/api/ask-creator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: subject.trim(), question: question.trim(), userToken: session.access_token }),
    })
    if (res.ok) {
      setStatus('sent')
      setSubject('')
      setQuestion('')
    } else {
      const d = await res.json()
      setStatus('error')
      setErrorMsg(d.error || 'Something went wrong. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
      </div>
    )
  }

  const isMax = userTier === 'max' || userTier === 'premium'

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="bg-white border-b border-slate-200 px-4 py-8">
          <div className="max-w-xl mx-auto">
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to dashboard
            </Link>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">✉️</span>
              <h1 className="text-2xl font-bold text-slate-900">Ask the Creator</h1>
              <span className="text-xs font-bold px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full">Max Only</span>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              Have a question about Arduino, electronics, or the course? Send it directly — I read every one.
            </p>
          </div>
        </div>

        <div className="max-w-xl mx-auto px-4 mt-8">
          {!isMax ? (
            <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
              <div className="bg-slate-900 px-6 py-8 text-center">
                <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white mb-2">Max Plan Feature</h2>
                <p className="text-slate-400 text-sm">Direct access to the creator is a Max plan exclusive.</p>
              </div>
              <div className="p-6 text-center">
                <p className="text-slate-600 text-sm mb-5">
                  Upgrade to Max to ask questions directly, get personal feedback, and access every other Max feature.
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-slate-900 text-white text-sm font-semibold rounded-md hover:bg-slate-800 transition-colors"
                >
                  Upgrade to Max
                </Link>
              </div>
            </div>
          ) : status === 'sent' ? (
            <div className="bg-white border border-slate-200 rounded-md p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Question sent!</h2>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Your question has been received. I try to respond to all Max member questions as fast as I can.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setStatus('idle')}
                  className="w-full py-2.5 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
                >
                  Ask another question
                </button>
                <Link href="/dashboard" className="text-sm text-slate-400 hover:text-slate-700 transition-colors">
                  Back to dashboard
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                <p className="text-sm font-semibold text-slate-900">Send your question</p>
                <p className="text-xs text-slate-400 mt-0.5">Your email is never shared — this goes straight to the creator's inbox.</p>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g. Question about PWM pins"
                    maxLength={120}
                    className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-slate-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Your question</label>
                  <textarea
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    placeholder="Write your question here — the more detail you give, the better I can help you."
                    rows={6}
                    maxLength={2000}
                    className="w-full border border-slate-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-slate-500 transition-colors resize-none"
                  />
                  <p className="text-xs text-slate-400 mt-1 text-right">{question.length}/2000</p>
                </div>
                {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
                <button
                  onClick={handleSubmit}
                  disabled={!subject.trim() || !question.trim() || status === 'sending'}
                  className="w-full py-3 bg-slate-900 text-white text-sm font-semibold rounded-md hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {status === 'sending' ? 'Sending…' : 'Send Question'}
                </button>
              </div>
            </div>
          )}

          {/* What kind of questions */}
          {isMax && status !== 'sent' && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-md">
              <p className="text-xs font-semibold text-amber-800 mb-2">Good questions to ask:</p>
              <ul className="space-y-1.5">
                {[
                  'Why is my circuit not working?',
                  'What component should I use for this project?',
                  'How do I advance from beginner to intermediate?',
                  'Can you recommend what to build next?',
                ].map((q, i) => (
                  <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                    <span className="mt-0.5">→</span> {q}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
