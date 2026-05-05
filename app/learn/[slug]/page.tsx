'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Copy, Wrench } from 'lucide-react'
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
      setLoading(false)
    }

    bootstrap()
  }, [params.slug, router])

  const activeStep = steps[stepIndex]
  const completedSteps = useMemo(() => new Set(progress?.completed_steps || []), [progress])

  const copyCode = async () => {
    if (!activeStep?.code_snippet) return
    await navigator.clipboard.writeText(activeStep.code_snippet)
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
    const done = nextIndex === steps.length - 1 && newCompleted.has(steps[steps.length - 1].step_index)

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
    setStepIndex(nextIndex)
  }

  const goBack = async () => {
    if (!lesson) return
    const nextIndex = Math.max(0, stepIndex - 1)
    setStepIndex(nextIndex)
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
        <div className="w-8 h-8 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!lesson || steps.length === 0 || !activeStep) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 pt-28">
          <div className="rounded border border-slate-200 bg-white p-6 text-slate-600">
            This lesson is not available yet. Please run the migration seed and refresh.
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-28">
        <div className="rounded border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            Step {stepIndex + 1} of {steps.length}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{lesson.title}</h1>
          <p className="mt-2 text-sm text-slate-600">{lesson.summary}</p>
        </div>

        <div className="mt-4 rounded border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">{activeStep.title}</h2>
          <p className="mt-2 whitespace-pre-line text-slate-700">{activeStep.instruction_md}</p>

          {activeStep.code_snippet && (
            <div className="mt-5 rounded border border-slate-200 bg-slate-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Arduino code</p>
                <button onClick={copyCode} className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900">
                  <Copy className="h-3 w-3" />
                  Copy
                </button>
              </div>
              <pre className="overflow-auto text-xs text-slate-800">{activeStep.code_snippet}</pre>
            </div>
          )}

          <div className="mt-5 rounded border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-900">Checkpoint</p>
            <p className="mt-1 text-sm text-slate-600">{activeStep.checkpoint_prompt || 'When done, click check answer to continue.'}</p>
            <div className="mt-3 flex gap-2">
              <input
                value={checkpointInput}
                onChange={(e) => setCheckpointInput(e.target.value)}
                placeholder="Type your short answer"
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
              <button onClick={checkAnswer} className="rounded bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800">
                Check
              </button>
            </div>
            {checkpointResult === 'correct' && <p className="mt-2 text-sm text-green-700">Great work. You got it.</p>}
            {checkpointResult === 'retry' && <p className="mt-2 text-sm text-amber-700">Not quite yet. Read the tip below and try again.</p>}
          </div>

          <div className="mt-5 rounded border border-slate-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 text-amber-800">
              <Wrench className="h-4 w-4" />
              <p className="text-sm font-medium">Troubleshooting guidance</p>
            </div>
            <p className="mt-2 whitespace-pre-line text-sm text-amber-900">{activeStep.troubleshooting_md}</p>
            <p className="mt-3 text-sm text-amber-900"><strong>Expected outcome:</strong> {activeStep.expected_outcome}</p>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button onClick={goBack} disabled={stepIndex === 0} className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700 disabled:opacity-50">
              Back
            </button>
            <button onClick={goNext} className="inline-flex items-center gap-2 rounded bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800">
              <CheckCircle2 className="h-4 w-4" />
              {stepIndex === steps.length - 1 ? 'Finish lesson' : 'Next step'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

