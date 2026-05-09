'use client'

import { useState, useEffect } from 'react'
import { Trophy, Lightbulb, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Challenge = {
  id?: string
  title: string
  description: string
  hints: string[]
  difficulty: string
  week_key: string
}

export default function WeeklyChallenge() {
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)
  const [hintsOpen, setHintsOpen] = useState(false)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)

      const res = await fetch('/api/weekly-challenge')
      if (res.ok) {
        const data = await res.json()
        setChallenge(data)

        // Check if already submitted
        if (session && data.id) {
          const { data: sub } = await supabase
            .from('weekly_challenge_submissions')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('challenge_id', data.id)
            .maybeSingle()
          if (sub) setSubmitted(true)
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  const handleSubmit = async () => {
    if (!description.trim() || !challenge?.id || submitting) return
    setSubmitting(true)
    setSubmitError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setSubmitError('Please log in to submit.'); setSubmitting(false); return }

    const res = await fetch('/api/weekly-challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        challengeId: challenge.id,
        description: description.trim(),
        userToken: session.access_token,
      }),
    })

    if (res.ok) {
      setSubmitted(true)
      setSubmitOpen(false)
    } else {
      const err = await res.json()
      setSubmitError(err.error || 'Submit failed — please try again.')
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-md p-5 mb-6 animate-pulse">
        <div className="h-4 bg-slate-100 rounded w-1/3 mb-3" />
        <div className="h-3 bg-slate-100 rounded w-2/3" />
      </div>
    )
  }

  if (!challenge) return null

  return (
    <div className="bg-white border border-amber-200 rounded-md overflow-hidden mb-6">
      {/* Header */}
      <div className="bg-amber-50 px-5 py-4 border-b border-amber-200 flex items-center gap-3">
        <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center shrink-0">
          <Trophy className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Weekly Challenge</p>
            <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded capitalize">{challenge.difficulty}</span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm mt-0.5">{challenge.title}</h3>
        </div>
        {submitted && (
          <div className="shrink-0 flex items-center gap-1 text-xs text-green-700 font-medium bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
            <CheckCircle2 className="w-3 h-3" /> Submitted
          </div>
        )}
      </div>

      <div className="p-5 space-y-4">
        <p className="text-sm text-slate-700 leading-relaxed">{challenge.description}</p>

        {/* Hints toggle */}
        {challenge.hints?.length > 0 && (
          <div>
            <button
              onClick={() => setHintsOpen(v => !v)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              {hintsOpen ? 'Hide hints' : 'Show hints'}
              {hintsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {hintsOpen && (
              <ul className="mt-2 space-y-1.5 pl-1">
                {challenge.hints.map((hint, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1 shrink-0" />
                    {hint}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Submit section */}
        {submitted ? (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <p className="text-sm text-green-800 font-medium">You've completed this week's challenge!</p>
          </div>
        ) : isLoggedIn ? (
          <>
            <button
              onClick={() => setSubmitOpen(v => !v)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-md transition-colors"
            >
              {submitOpen ? 'Cancel' : '✓ Submit my completion'}
            </button>
            {submitOpen && (
              <div className="space-y-2">
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe what you built — what worked, what you learned, any cool tricks…"
                  rows={3}
                  className="w-full text-sm border border-slate-200 rounded-md px-3 py-2.5 focus:outline-none focus:border-slate-400 resize-none"
                />
                {submitError && <p className="text-xs text-red-600">{submitError}</p>}
                <button
                  onClick={handleSubmit}
                  disabled={!description.trim() || submitting}
                  className="w-full py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-md hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Submitting…' : 'Submit'}
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-xs text-slate-500 text-center">
            <a href="/" className="font-medium text-slate-800 hover:underline">Sign up</a> to submit your completion and earn the Challenge Champ badge.
          </p>
        )}
      </div>
    </div>
  )
}
