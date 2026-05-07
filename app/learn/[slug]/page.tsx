'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Copy, Wrench, ArrowLeft, ArrowRight, BookOpen } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { getLessonBySlug, saveLessonProgress, submitStepCheck } from '@/lib/learning'
import type { LearningLesson, LearningLessonStep, LearningUserLessonProgress } from '@/types'

export default function LessonPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [lesson, setLesson] = useState<LearningLesson | null>(null)
  const [steps, setSteps] = useState<LearningLessonStep[]>([])
  const [progress, setProgress] = useState<LearningUserLessonProgress | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [checkpointInput, setCheckpointInput] = useState('')
  const [checkpointResult, setCheckpointResult] = useState<'idle' | 'correct' | 'retry'>('idle')
  const [copied, setCopied] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const bootstrap = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
        return
      }
      const data = await getLessonBySlug(params.slug)
      setLesson(data.lesson)
      setSteps(data.steps)
      setProgress(data.progress)
      setStepIndex(data.progress?.current_step_index || 0)
      if (data.progress?.status === 'completed') setIsComplete(true)
      setLoading(false)
    }
    bootstrap()
  }, [params.slug, router])

  const activeStep = steps[stepIndex]
  const completedSteps = useMemo(() => new Set(progress?.completed_steps || []), [progress])

  const copyCode = async () => {
    if (!activeStep?.code_snippet) return
    await navigator.clipboard.writeText(activeStep.code_snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const localDate = () => {
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const checkAnswer = async () => {
    if (!activeStep || !lesson) return
    const expected = (activeStep.checkpoint_answer || '').trim().toLowerCase()
    const given = checkpointInput.trim().toLowerCase()
    const isCorrect = expected.length === 0 || given.includes(expected)
    setCheckpointResult(isCorrect ? 'correct' : 'retry')
    if (isCorrect) {
      await submitStepCheck({
        lessonId: lesson.id,
        stepId: activeStep.id,
        localDate: localDate(),
        isCorrect,
      })
    }
  }

  const goNext = async () => {
    if (!lesson || !activeStep) return
    const newCompleted = new Set(completedSteps)
    newCompleted.add(activeStep.step_index)

    const nextIndex = Math.min(stepIndex + 1, steps.length - 1)
    const done =
      nextIndex === steps.length - 1 &&
      newCompleted.has(steps[steps.length - 1].step_index)

    await saveLessonProgress({
      lessonId: lesson.id,
      currentStepIndex: nextIndex,
      completedSteps: Array.from(newCompleted),
      isCompleted: done,
    })

    setProgress((prev) => ({
      user_id: prev?.user_id || '',
      lesson_id: lesson.id,
      status: done ? 'completed' : 'in_progress',
      current_step_index: nextIndex,
      completed_steps: Array.from(newCompleted),
      started_at: prev?.started_at || new Date().toISOString(),
      completed_at: done ? new Date().toISOString() : null,
      last_seen_at: new Date().toISOString(),
    }))

    setCheckpointInput('')
    setCheckpointResult('idle')

    if (stepIndex === steps.length - 1) {
      setIsComplete(true)
    } else {
      setStepIndex(nextIndex)
    }
  }

  const goBack = async () => {
    if (!lesson) return
    const nextIndex = Math.max(0, stepIndex - 1)
    setStepIndex(nextIndex)
    setCheckpointResult('idle')
    await saveLessonProgress({
      lessonId: lesson.id,
      currentStepIndex: nextIndex,
      completedSteps: Array.from(completedSteps),
      isCompleted: progress?.status === 'completed',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!lesson || steps.length === 0 || !activeStep) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 pt-28">
          <div className="bg-white border border-slate-200 rounded-md p-8 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 mb-1">This lesson is not available yet.</p>
            <p className="text-sm text-slate-400 mb-4">Run the migration seed and refresh to load it.</p>
            <Link href="/learn" className="text-sm text-slate-700 underline underline-offset-2 hover:text-slate-900">
              Back to lesson library
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const progressPercent = Math.round(((stepIndex + 1) / steps.length) * 100)

  if (isComplete) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 pt-28 pb-16">
          <div className="bg-white border border-slate-200 rounded-md p-8 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-md flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-slate-700" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Lesson complete!</h1>
            <p className="text-slate-500 mb-2">{lesson.title}</p>
            <p className="text-sm text-slate-400 mb-8">
              You finished all {steps.length} steps. Great work — keep that streak going.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/learn"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Next lesson
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors"
              >
                Go to dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-24">

        {/* Back link */}
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to library
        </Link>

        {/* Lesson header */}
        <div className="bg-white border border-slate-200 rounded-md p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-slate-400">
              Step {stepIndex + 1} of {steps.length}
            </p>
            <span className="text-xs font-medium text-slate-500">{progressPercent}% complete</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
            <div
              className="bg-slate-700 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <h1 className="text-xl font-bold text-slate-900 mb-1">{lesson.title}</h1>
          <p className="text-sm text-slate-500">{lesson.summary}</p>
        </div>

        {/* Step content */}
        <div className="bg-white border border-slate-200 rounded-md p-6 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">{stepIndex + 1}</span>
            </div>
            <h2 className="text-base font-semibold text-slate-900">{activeStep.title}</h2>
          </div>

          <p className="mt-3 whitespace-pre-line text-slate-600 text-sm leading-relaxed">
            {activeStep.instruction_md}
          </p>

          {/* Code block */}
          {activeStep.code_snippet && (
            <div className="mt-5 bg-slate-900 rounded-md overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700">
                <span className="text-xs text-slate-400 font-mono">Arduino</span>
                <button
                  onClick={copyCode}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <Copy className="h-3 w-3" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="overflow-auto px-4 py-4 text-xs text-slate-200 font-mono leading-relaxed">
                {activeStep.code_snippet}
              </pre>
            </div>
          )}

          {/* Checkpoint */}
          <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-md">
            <p className="text-sm font-semibold text-slate-900 mb-1">Checkpoint</p>
            <p className="text-sm text-slate-500 mb-3">
              {activeStep.checkpoint_prompt || 'When done, click Check to continue.'}
            </p>
            <div className="flex gap-2">
              <input
                value={checkpointInput}
                onChange={(e) => setCheckpointInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') checkAnswer() }}
                placeholder="Type your short answer"
                className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none bg-white"
              />
              <button
                onClick={checkAnswer}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 transition-colors"
              >
                Check
              </button>
            </div>
            {checkpointResult === 'correct' && (
              <p className="mt-2 text-sm text-green-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Correct — well done!
              </p>
            )}
            {checkpointResult === 'retry' && (
              <p className="mt-2 text-sm text-amber-700">
                Not quite. Read the troubleshooting tip below and try again.
              </p>
            )}
          </div>

          {/* Troubleshooting */}
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex items-center gap-2 text-amber-800 mb-2">
              <Wrench className="h-4 w-4 shrink-0" />
              <p className="text-sm font-semibold">Troubleshooting</p>
            </div>
            <p className="whitespace-pre-line text-sm text-amber-900 leading-relaxed">
              {activeStep.troubleshooting_md}
            </p>
            {activeStep.expected_outcome && (
              <p className="mt-3 text-sm text-amber-900 border-t border-amber-200 pt-3">
                <span className="font-semibold">Expected outcome:</span> {activeStep.expected_outcome}
              </p>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={goBack}
              disabled={stepIndex === 0}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={goNext}
              className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
            >
              {stepIndex === steps.length - 1 ? 'Finish lesson' : 'Next step'}
              {stepIndex < steps.length - 1 && <ArrowRight className="h-4 w-4" />}
              {stepIndex === steps.length - 1 && <CheckCircle2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
