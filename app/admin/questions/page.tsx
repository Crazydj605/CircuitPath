'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

type Question = {
  id: string
  user_email: string
  subject: string
  question: string
  created_at: string
}

export default function AdminQuestions() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session || session.user.email !== 'dominictocco20@gmail.com') {
        router.push('/dashboard')
        return
      }
      const res = await fetch('/api/admin/questions', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setQuestions(data)
      }
      setLoading(false)
    })
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-20 pb-16 max-w-3xl mx-auto px-4">
        <div className="mt-8 mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Creator Questions</h1>
          <p className="text-slate-500 text-sm mt-1">{questions.length} questions from Max members</p>
        </div>
        {questions.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-md p-8 text-center">
            <p className="text-slate-500">No questions yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map(q => (
              <div key={q.id} className="bg-white border border-slate-200 rounded-md p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{q.subject}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{q.user_email} · {new Date(q.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{q.question}</p>
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <a
                    href={`mailto:${q.user_email}?subject=Re: ${encodeURIComponent(q.subject)}`}
                    className="text-xs font-medium text-violet-600 hover:text-violet-800 transition-colors"
                  >
                    Reply via email →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
