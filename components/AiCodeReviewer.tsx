'use client'

import { useState } from 'react'
import { Bot, AlertCircle, Lightbulb, CheckCircle2, Zap, Lock } from 'lucide-react'
import Link from 'next/link'

const FREE_LIMIT = 3
const STORAGE_KEY = () => `cp_review_${new Date().toLocaleDateString('en-CA')}`

type ReviewResult = {
  summary: string
  issues: string[]
  improvements: string[]
}

export default function AiCodeReviewer({ userTier = 'free' }: { userTier?: string }) {
  const [code, setCode] = useState('')
  const [result, setResult] = useState<ReviewResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isPro = userTier === 'pro' || userTier === 'premium' || userTier === 'max'
  const usedToday = parseInt(typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY()) || '0' : '0')
  const reviewsLeft = isPro ? Infinity : Math.max(0, FREE_LIMIT - usedToday)
  const isLimitReached = !isPro && usedToday >= FREE_LIMIT

  const handleReview = async () => {
    if (!code.trim() || loading || isLimitReached) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/review-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      if (!res.ok) {
        setError('Review failed — please try again.')
        return
      }

      const data = await res.json()
      setResult(data)

      // Increment usage
      if (!isPro) {
        localStorage.setItem(STORAGE_KEY(), String(usedToday + 1))
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-md overflow-hidden mb-8">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-violet-100 rounded flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">AI Code Reviewer</h3>
            <p className="text-xs text-slate-400">Paste your Arduino code — get instant feedback</p>
          </div>
        </div>
        {!isPro && (
          <span className="text-xs text-slate-500">
            {isLimitReached ? (
              <span className="flex items-center gap-1 text-amber-600 font-medium">
                <Lock className="w-3 h-3" /> Limit reached
              </span>
            ) : (
              <span className={reviewsLeft <= 1 ? 'text-amber-600 font-medium' : ''}>
                {reviewsLeft} review{reviewsLeft !== 1 ? 's' : ''} left today
              </span>
            )}
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Code input */}
        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder={`Paste your Arduino code here, e.g.:\n\nvoid setup() {\n  pinMode(9, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(9, HIGH);\n  delay(1000);\n  digitalWrite(9, LOW);\n  delay(1000);\n}`}
          rows={8}
          className="w-full font-mono text-xs bg-slate-950 text-slate-200 rounded-md p-4 border border-slate-800 focus:outline-none focus:border-slate-600 resize-y placeholder-slate-600"
        />

        {/* Actions */}
        {isLimitReached ? (
          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">Daily limit reached</p>
              <p className="text-xs text-amber-700">Upgrade to Pro for unlimited reviews.</p>
            </div>
            <Link
              href="/pricing"
              className="shrink-0 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800 transition-colors"
            >
              Go Pro
            </Link>
          </div>
        ) : (
          <button
            onClick={handleReview}
            disabled={!code.trim() || loading}
            className="w-full py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-md hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Reviewing your code...
              </>
            ) : (
              <>
                <Bot className="w-4 h-4" />
                Review my code
              </>
            )}
          </button>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </p>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            {/* Summary */}
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">What it does</p>
                <p className="text-sm text-slate-700 leading-relaxed">{result.summary}</p>
              </div>
            </div>

            {/* Issues */}
            {result.issues.length > 0 && (
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Things to check</p>
                  <ul className="space-y-1.5">
                    {result.issues.map((issue, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 shrink-0" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {result.issues.length === 0 && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <p className="text-sm text-green-800 font-medium">No issues found — clean code!</p>
              </div>
            )}

            {/* Improvements */}
            {result.improvements.length > 0 && (
              <div className="flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Ideas to level up</p>
                  <ul className="space-y-1.5">
                    {result.improvements.map((tip, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
