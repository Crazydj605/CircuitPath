'use client'

import { useEffect, useState } from 'react'
import { Flame, CheckCircle2, XCircle, Lightbulb } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { submitDailyChallenge } from '@/lib/learning'

type Challenge = {
  id: string
  question: string
  options: string[]
  correct_index: number
  explanation: string
  topic: string
  challenge_date: string
}

type UserResponse = {
  selected_index: number
  is_correct: boolean
}

export default function DailyChallenge() {
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [userResponse, setUserResponse] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/daily-challenge')
      if (!res.ok) { setLoading(false); return }
      const data: Challenge = await res.json()
      setChallenge(data)

      if (data.id !== 'temp') {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: existing } = await supabase
            .from('daily_challenge_responses')
            .select('selected_index, is_correct')
            .eq('user_id', user.id)
            .eq('challenge_id', data.id)
            .maybeSingle()
          if (existing) {
            setUserResponse({ selected_index: existing.selected_index, is_correct: existing.is_correct })
          }
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleAnswer = async (index: number) => {
    if (!challenge || submitting || userResponse) return
    setSubmitting(true)
    const isCorrect = index === challenge.correct_index
    const localDate = new Date().toLocaleDateString('en-CA')
    const { error } = await submitDailyChallenge({
      challengeId: challenge.id,
      selectedIndex: index,
      isCorrect,
      localDate,
    })
    if (!error) setUserResponse({ selected_index: index, is_correct: isCorrect })
    setSubmitting(false)
  }

  const dateLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const answered = userResponse !== null

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-md p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-amber-100 rounded flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="font-semibold text-slate-900">Daily Challenge</h3>
        </div>
        <div className="h-16 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!challenge) return null

  return (
    <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-amber-100 rounded flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm leading-none mb-0.5">Daily Challenge</h3>
              <p className="text-xs text-slate-400">{challenge.topic} · {dateLabel}</p>
            </div>
          </div>
          {answered ? (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              userResponse.is_correct ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {userResponse.is_correct ? '✓ +25 XP earned' : 'Completed'}
            </span>
          ) : (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              +25 XP
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <p className="text-sm font-semibold text-slate-900 mb-4 leading-snug">{challenge.question}</p>

        <div className="space-y-2">
          {challenge.options.map((option, i) => {
            const isCorrectOption = i === challenge.correct_index
            const isSelected = answered && userResponse.selected_index === i
            const letter = ['A', 'B', 'C', 'D'][i]

            let rowStyle = 'border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50 cursor-pointer'
            let letterStyle = 'bg-slate-100 text-slate-500'

            if (answered) {
              if (isCorrectOption) {
                rowStyle = 'border-green-400 bg-green-50 text-green-800 cursor-default'
                letterStyle = 'bg-green-500 text-white'
              } else if (isSelected) {
                rowStyle = 'border-red-300 bg-red-50 text-red-700 cursor-default'
                letterStyle = 'bg-red-400 text-white'
              } else {
                rowStyle = 'border-slate-100 text-slate-400 cursor-default'
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={answered || submitting}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md border text-sm text-left transition-all disabled:cursor-default ${rowStyle}`}
              >
                <span className={`w-5 h-5 rounded text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${letterStyle}`}>
                  {letter}
                </span>
                <span className="flex-1">{option}</span>
                {answered && isCorrectOption && (
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                )}
                {answered && isSelected && !userResponse.is_correct && (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
              </button>
            )
          })}
        </div>

        {answered && (
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-md space-y-2">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed">{challenge.explanation}</p>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" />
              Streak kept alive — come back tomorrow for a new question!
            </p>
          </div>
        )}

        {!answered && (
          <p className="mt-3 text-xs text-slate-400 text-center">Pick an answer to keep your streak alive</p>
        )}
      </div>
    </div>
  )
}
