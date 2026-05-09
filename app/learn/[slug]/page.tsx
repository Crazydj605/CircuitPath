'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Copy, Wrench, ArrowLeft, ArrowRight, BookOpen, Check, Code2, Lock, Zap } from 'lucide-react'
import ShareCard from '@/components/ShareCard'
import Navbar from '@/components/Navbar'
import { RenderMd } from '@/components/RenderMd'
import AiTutor from '@/components/AiTutor'
import { supabase } from '@/lib/supabase'
import confetti from 'canvas-confetti'
import { getLessonBySlug, saveLessonProgress, submitStepCheck } from '@/lib/learning'
import type { LearningLesson, LearningLessonStep, LearningUserLessonProgress } from '@/types'

function difficultyStyle(d: string) {
  switch (d?.toLowerCase()) {
    case 'beginner': return 'bg-green-100 text-green-700'
    case 'intermediate': return 'bg-amber-100 text-amber-700'
    case 'advanced': return 'bg-red-100 text-red-700'
    default: return 'bg-slate-100 text-slate-600'
  }
}

export default function LessonPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [lesson, setLesson] = useState<LearningLesson | null>(null)
  const [steps, setSteps] = useState<LearningLessonStep[]>([])
  const [progress, setProgress] = useState<LearningUserLessonProgress | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [checkpointResult, setCheckpointResult] = useState<'idle' | 'correct' | 'retry'>('idle')
  const [copied, setCopied] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [userTier, setUserTier] = useState<string>('free')

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (isComplete || loading) return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goBack()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isComplete, loading, stepIndex, steps, lesson, progress, completedSteps])

  useEffect(() => {
    const bootstrap = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }
      const [data, profileResult] = await Promise.all([
        getLessonBySlug(params.slug),
        supabase.from('profiles').select('subscription_tier').eq('id', session.user.id).maybeSingle(),
      ])
      setLesson(data.lesson)
      setSteps(data.steps)
      setProgress(data.progress)
      setStepIndex(data.progress?.current_step_index || 0)
      if (data.progress?.status === 'completed') setIsComplete(true)
      setUserTier(profileResult.data?.subscription_tier || 'free')
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
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  }

  const checkAnswerDirect = async (answer: 'yes' | 'no') => {
    if (!activeStep || !lesson) return
    const isCorrect = answer === 'yes'
    setCheckpointResult(isCorrect ? 'correct' : 'retry')
    if (isCorrect) {
      await submitStepCheck({ lessonId: lesson.id, stepId: activeStep.id, localDate: localDate(), isCorrect: true })
    }
  }

  const goNext = async () => {
    if (!lesson || !activeStep) return
    const newCompleted = new Set(completedSteps)
    newCompleted.add(activeStep.step_index)
    const nextIndex = Math.min(stepIndex + 1, steps.length - 1)
    const done = nextIndex === steps.length - 1 && newCompleted.has(steps[steps.length - 1].step_index)
    await saveLessonProgress({
      lessonId: lesson.id,
      currentStepIndex: nextIndex,
      completedSteps: Array.from(newCompleted),
      isCompleted: done,
    })
    setProgress(prev => ({
      user_id: prev?.user_id || '',
      lesson_id: lesson.id,
      status: done ? 'completed' : 'in_progress',
      current_step_index: nextIndex,
      completed_steps: Array.from(newCompleted),
      started_at: prev?.started_at || new Date().toISOString(),
      completed_at: done ? new Date().toISOString() : null,
      last_seen_at: new Date().toISOString(),
    }))
    setCheckpointResult('idle')
    if (stepIndex === steps.length - 1) {
      setIsComplete(true)
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#1e293b', '#f59e0b', '#10b981', '#3b82f6'] })
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
      </div>
    )
  }

  // Tier gating
  const canAccess = (() => {
    if (!lesson) return true
    if (lesson.required_tier === 'free') return true
    if (lesson.required_tier === 'pro') return userTier === 'pro' || userTier === 'premium' || userTier === 'max'
    if (lesson.required_tier === 'max') return userTier === 'max' || userTier === 'premium'
    return true
  })()

  if (!loading && lesson && !canAccess) {
    const tierLabel = lesson.required_tier === 'max' ? 'Max' : 'Pro'
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 pt-28 pb-16">
          <Link
            href="/learn"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to library
          </Link>
          <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
            <div className="bg-slate-900 px-6 py-8 text-center">
              <div className="w-14 h-14 bg-white/10 rounded-md flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-2">{tierLabel} Lesson</p>
              <h1 className="text-xl font-bold text-white mb-1">{lesson.title}</h1>
              <p className="text-slate-400 text-sm">{lesson.summary}</p>
            </div>
            <div className="p-8">
              <p className="text-slate-700 font-medium mb-5">Upgrade to {tierLabel} to unlock this lesson and everything below it:</p>
              <ul className="space-y-3 mb-8">
                {[
                  'Full lesson library — all current and future lessons',
                  'Step checkpoints with real teaching explanations',
                  'Troubleshooting guides for every step',
                  'Progress tracking, XP, and streak tools',
                  'New lessons added every month',
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className="block w-full text-center py-3 bg-slate-900 text-white rounded-md font-semibold text-sm hover:bg-slate-800 transition-colors mb-3"
              >
                Upgrade to {tierLabel} — Unlock Everything
              </Link>
              <Link
                href="/learn"
                className="block w-full text-center py-2.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
              >
                Back to free lessons
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!lesson || steps.length === 0 || !activeStep) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 pt-28">
          <div className="bg-white border border-slate-200 rounded-md p-8 text-center">
            <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-600 mb-1 font-medium">Lesson not available yet</p>
            <p className="text-sm text-slate-400 mb-5">Run the migration seed and refresh to load it.</p>
            <Link href="/learn" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm rounded-md hover:bg-slate-800 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to library
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // Completion screen
  if (isComplete) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 pt-28 pb-16">
          <div className="bg-white border border-slate-200 rounded-md overflow-hidden text-center">
            <div className="bg-slate-900 px-6 py-8">
              <div className="w-16 h-16 bg-white/10 rounded-md flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-9 h-9 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Lesson Complete!</h1>
              <p className="text-slate-400 text-sm">{lesson.title}</p>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-md text-center">
                  <p className="text-2xl font-bold text-slate-900">{steps.length}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Steps completed</p>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-center">
                  <p className="text-2xl font-bold text-amber-600">+{steps.length * 50}</p>
                  <p className="text-xs text-amber-500 mt-0.5">XP earned</p>
                </div>
              </div>
              <p className="text-slate-600 mb-6 leading-relaxed text-sm">
                Great work! Every completed lesson builds your streak and XP. Keep the momentum going!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                <Link
                  href="/learn"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
                >
                  <BookOpen className="w-4 h-4" /> Next lesson
                </Link>
                <button
                  onClick={() => { setIsComplete(false); setStepIndex(0); setCheckpointResult('idle') }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors"
                >
                  Redo lesson
                </button>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors"
                >
                  Dashboard
                </Link>
              </div>
              <div className="border-t border-slate-100 pt-6">
                <ShareCard lessonTitle={lesson.title} steps={steps.length} xp={steps.length * 50} />
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  const progressPct = Math.round(((stepIndex + 1) / steps.length) * 100)

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-20">

        {/* Back */}
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors mt-4 mb-5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to library
        </Link>

        {/* Lesson header */}
        <div className="bg-white border border-slate-200 rounded-md p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${difficultyStyle(lesson.difficulty)}`}>
                {lesson.difficulty}
              </span>
              <span className="text-xs text-slate-400">{lesson.estimated_minutes} min</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">{progressPct}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
            <div
              className="bg-slate-800 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <h1 className="text-xl font-bold text-slate-900 mb-1">{lesson.title}</h1>
          <p className="text-sm text-slate-500">{lesson.summary}</p>

          {/* Step pills */}
          <div className="flex items-center gap-1.5 mt-4 flex-wrap">
            {steps.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setStepIndex(i)}
                className={`w-7 h-7 rounded flex items-center justify-center text-xs font-medium transition-colors ${
                  i === stepIndex
                    ? 'bg-slate-900 text-white'
                    : completedSteps.has(s.step_index)
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
              >
                {completedSteps.has(s.step_index) && i !== stepIndex
                  ? <Check className="w-3 h-3" />
                  : i + 1
                }
              </button>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden mb-4">

          {/* Step header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-7 h-7 bg-slate-900 rounded flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">{stepIndex + 1}</span>
            </div>
            <h2 className="text-base font-semibold text-slate-900">{activeStep.title}</h2>
          </div>

          <div className="p-6 space-y-5">
            {/* Instructions */}
            <RenderMd text={activeStep.instruction_md} />

            {/* Code block */}
            {activeStep.code_snippet && (
              <div className="bg-slate-900 rounded-md overflow-hidden border border-slate-800">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                    <span className="text-xs text-slate-400 font-mono">Arduino</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/code#${params.slug}-${activeStep.step_index}`}
                      className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium"
                    >
                      <Code2 className="h-3 w-3" /> Understand this code
                    </Link>
                    <button
                      onClick={copyCode}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      {copied ? <><Check className="h-3 w-3 text-green-400" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                    </button>
                  </div>
                </div>
                <pre className="overflow-auto px-4 py-4 text-xs text-slate-200 font-mono leading-relaxed">
                  {activeStep.code_snippet}
                </pre>
              </div>
            )}

            {/* Checkpoint */}
            <div className="rounded-md border border-slate-200 overflow-hidden">
              {/* Teaching section */}
              {activeStep.checkpoint_teach_md && (
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Before you answer</p>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {activeStep.checkpoint_teach_md}
                  </p>
                </div>
              )}

              {/* Question + buttons */}
              <div className={`p-4 transition-colors ${
                checkpointResult === 'correct'
                  ? 'bg-green-50'
                  : checkpointResult === 'retry'
                  ? 'bg-amber-50'
                  : 'bg-white'
              }`}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Checkpoint</p>
                <p className="text-sm font-medium text-slate-900 mb-4">
                  {activeStep.checkpoint_prompt || 'Did this step make sense?'}
                </p>

                {checkpointResult === 'idle' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => checkAnswerDirect('yes')}
                      className="flex-1 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => checkAnswerDirect('no')}
                      className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors"
                    >
                      No
                    </button>
                  </div>
                )}

                {checkpointResult === 'correct' && (
                  <p className="text-sm text-green-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Great work — move to the next step!
                  </p>
                )}

                {checkpointResult === 'retry' && (
                  <div>
                    <p className="text-sm text-amber-700 mb-3">
                      No worries — re-read the explanation above, check the troubleshooting tip below, then try again.
                    </p>
                    <button
                      onClick={() => setCheckpointResult('idle')}
                      className="text-sm text-slate-600 underline underline-offset-2 hover:text-slate-900 transition-colors"
                    >
                      Try again
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Troubleshooting */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-center gap-2 text-amber-800 mb-2">
                <Wrench className="h-4 w-4 shrink-0" />
                <p className="text-sm font-semibold">Troubleshooting tip</p>
              </div>
              <p className="whitespace-pre-line text-sm text-amber-900 leading-relaxed">
                {activeStep.troubleshooting_md}
              </p>
              {activeStep.expected_outcome && (
                <p className="mt-3 text-sm text-amber-900 pt-3 border-t border-amber-200">
                  <span className="font-semibold">Expected outcome:</span> {activeStep.expected_outcome}
                </p>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            <button
              onClick={goBack}
              disabled={stepIndex === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-slate-300 text-sm text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={goNext}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              {stepIndex === steps.length - 1
                ? <><CheckCircle2 className="w-4 h-4" /> Finish lesson</>
                : <>Next step <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </div>
        </div>
      </div>
      <AiTutor />
    </main>
  )
}
