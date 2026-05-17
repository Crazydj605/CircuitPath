'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getLessonBySlug } from '@/lib/learning'
import { LESSON_SUMMARIES } from '@/lib/quizzes'
import type { LearningLesson, LearningLessonStep } from '@/types'

export default function LessonPrint({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [lesson, setLesson] = useState<LearningLesson | null>(null)
  const [steps, setSteps] = useState<LearningLessonStep[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }
      const { data: profile } = await supabase.from('profiles').select('subscription_tier').eq('id', session.user.id).maybeSingle()
      const tier = profile?.subscription_tier || 'free'
      if (tier !== 'max' && tier !== 'premium') { router.push(`/learn/${params.slug}`); return }
      const data = await getLessonBySlug(params.slug)
      setLesson(data.lesson)
      setSteps(data.steps)
      setLoading(false)
    }
    init()
  }, [params.slug, router])

  useEffect(() => {
    if (!loading && lesson) {
      setTimeout(() => window.print(), 500)
    }
  }, [loading, lesson])

  if (loading || !lesson) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
      </div>
    )
  }

  const summary = LESSON_SUMMARIES[params.slug]

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { font-size: 12pt; color: #000; }
          .page-break { page-break-before: always; }
        }
        @media screen {
          body { background: #f8fafc; }
        }
      `}</style>

      <div className="max-w-2xl mx-auto px-8 py-10 bg-white min-h-screen">
        {/* Print controls - hidden on print */}
        <div className="no-print flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <p className="text-sm text-gray-500">Preview — your browser print dialog will open automatically</p>
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
            >
              Save as PDF
            </button>
            <button
              onClick={() => window.close()}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6 pb-4 border-b-2 border-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">CircuitPath Lesson</p>
              <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
              <p className="text-gray-500 text-sm mt-1">{lesson.summary}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Difficulty</p>
              <p className="text-sm font-semibold text-gray-700 capitalize">{lesson.difficulty}</p>
              <p className="text-xs text-gray-400 mt-1">Est. time</p>
              <p className="text-sm font-semibold text-gray-700">{lesson.estimated_minutes} min</p>
            </div>
          </div>
        </div>

        {/* Summary if available */}
        {summary && (
          <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-200">
            <h2 className="text-sm font-bold text-gray-800 mb-2">What you'll build</h2>
            <p className="text-sm text-gray-700 leading-relaxed">{summary.whatYouBuilt}</p>
          </div>
        )}

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, i) => (
            <div key={step.id} className="border border-gray-200 rounded overflow-hidden">
              <div className="bg-gray-900 text-white px-4 py-2.5 flex items-center gap-3">
                <span className="w-6 h-6 bg-white/20 rounded text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <span className="text-sm font-semibold">{step.title}</span>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-3">{step.instruction_md}</p>
                {step.code_snippet && (
                  <div className="bg-gray-900 rounded p-3 mb-3">
                    <pre className="text-xs text-gray-200 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">{step.code_snippet}</pre>
                  </div>
                )}
                {step.troubleshooting_md && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded">
                    <p className="text-xs font-bold text-amber-800 mb-1">Troubleshooting tip</p>
                    <p className="text-xs text-amber-900 leading-relaxed whitespace-pre-line">{step.troubleshooting_md}</p>
                  </div>
                )}
                {step.expected_outcome && (
                  <div className="mt-2 p-2 border-l-2 border-green-400">
                    <p className="text-xs text-gray-600"><span className="font-semibold">Expected outcome:</span> {step.expected_outcome}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Key concepts */}
        {summary && (
          <div className="mt-8 pt-4 border-t-2 border-gray-900">
            <h2 className="text-base font-bold text-gray-900 mb-4">Key Concepts</h2>
            <div className="space-y-2">
              {summary.keyConcepts.map((c, i) => (
                <div key={i} className="flex gap-3">
                  <span className="font-semibold text-sm text-gray-800 min-w-0 shrink-0" style={{ width: '180px' }}>{c.term}</span>
                  <span className="text-sm text-gray-600 leading-relaxed">{c.definition}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">Generated from CircuitPath · circuitpath.net · Max Plan</p>
        </div>
      </div>
    </>
  )
}
