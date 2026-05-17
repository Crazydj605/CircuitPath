'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Copy, Wrench, ArrowLeft, ArrowRight, BookOpen, Check, Code2, Lock, Zap, Play, LogOut } from 'lucide-react'
import ShareCard from '@/components/ShareCard'
import ComponentKitLink from '@/components/ComponentKitLink'
import Navbar from '@/components/Navbar'
import { RenderMd } from '@/components/RenderMd'
import AiTutor from '@/components/AiTutor'
import AuthModal from '@/components/AuthModal'
import { supabase } from '@/lib/supabase'
import confetti from 'canvas-confetti'
import { getLessonBySlug, saveLessonProgress, submitStepCheck } from '@/lib/learning'
import { LESSON_QUIZZES, LESSON_SUMMARIES } from '@/lib/quizzes'
import { analytics } from '@/lib/analytics'
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
  const [isGuest, setIsGuest] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)

  // Quiz states
  const [quizPhase, setQuizPhase] = useState<'lesson' | 'quiz' | 'quiz-fail' | 'summary'>('lesson')
  const [currentQ, setCurrentQ] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>([])
  const [quizScore, setQuizScore] = useState(0)

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (isComplete || loading || quizPhase !== 'lesson') return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goBack()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isComplete, loading, stepIndex, steps, lesson, progress, quizPhase])

  useEffect(() => {
    const bootstrap = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setIsGuest(true)
        const data = await getLessonBySlug(params.slug)
        setLesson(data.lesson)
        setSteps(data.steps)
        setStepIndex(0)
        setLoading(false)
        return
      }
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
      analytics.lessonStart(params.slug)
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

  const markLessonComplete = async () => {
    if (!lesson) return
    await saveLessonProgress({
      lessonId: lesson.id,
      currentStepIndex: steps.length - 1,
      completedSteps: Array.from(completedSteps),
      isCompleted: true,
    })
    setProgress(prev => ({
      user_id: prev?.user_id || '',
      lesson_id: lesson.id,
      status: 'completed',
      current_step_index: steps.length - 1,
      completed_steps: Array.from(completedSteps),
      started_at: prev?.started_at || new Date().toISOString(),
      completed_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
    }))
    setIsComplete(true)
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#1e293b', '#f59e0b', '#10b981', '#3b82f6'] })
    analytics.lessonComplete(lesson.slug, 50 * steps.length)
  }

  const saveAndExit = async () => {
    if (!lesson) return
    await saveLessonProgress({
      lessonId: lesson.id,
      currentStepIndex: stepIndex,
      completedSteps: Array.from(completedSteps),
      isCompleted: progress?.status === 'completed',
    })
    router.push('/learn')
  }

  const goNext = async () => {
    if (!lesson || !activeStep) return
    const newCompleted = new Set(completedSteps)
    newCompleted.add(activeStep.step_index)
    const nextIndex = Math.min(stepIndex + 1, steps.length - 1)
    const isLastStep = stepIndex === steps.length - 1

    await saveLessonProgress({
      lessonId: lesson.id,
      currentStepIndex: nextIndex,
      completedSteps: Array.from(newCompleted),
      isCompleted: false,
    })
    setProgress(prev => ({
      user_id: prev?.user_id || '',
      lesson_id: lesson.id,
      status: 'in_progress',
      current_step_index: nextIndex,
      completed_steps: Array.from(newCompleted),
      started_at: prev?.started_at || new Date().toISOString(),
      completed_at: null,
      last_seen_at: new Date().toISOString(),
    }))
    setCheckpointResult('idle')

    if (isLastStep) {
      const quiz = LESSON_QUIZZES[params.slug] || []
      if (quiz.length > 0) {
        setQuizPhase('quiz')
        setCurrentQ(0)
        setQuizAnswers(new Array(quiz.length).fill(null))
        setQuizScore(0)
      } else {
        await markLessonComplete()
      }
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

  const handleSelectAnswer = (optionIndex: number) => {
    if (quizAnswers[currentQ] !== null) return
    const newAnswers = [...quizAnswers]
    newAnswers[currentQ] = optionIndex
    setQuizAnswers(newAnswers)
  }

  const handleQuizNext = () => {
    const quiz = LESSON_QUIZZES[params.slug] || []
    if (currentQ < quiz.length - 1) {
      setCurrentQ(prev => prev + 1)
    } else {
      const score = quizAnswers.reduce((acc, answer, i) => {
        return acc + (answer === quiz[i].correctIndex ? 1 : 0)
      }, 0)
      setQuizScore(score)
      if (score >= 3) {
        markLessonComplete()
      } else {
        setQuizPhase('quiz-fail')
      }
    }
  }

  const resetQuiz = () => {
    const quiz = LESSON_QUIZZES[params.slug] || []
    setQuizPhase('quiz')
    setCurrentQ(0)
    setQuizAnswers(new Array(quiz.length).fill(null))
    setQuizScore(0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
      </div>
    )
  }

  // Tier gating
  // Early-access window: any lesson with max_only_until in the future is Max-only.
  const isInEarlyAccessWindow =
    !!lesson?.max_only_until && new Date(lesson.max_only_until) > new Date()

  const canAccess = (() => {
    if (!lesson) return true
    if (isInEarlyAccessWindow) return userTier === 'max' || userTier === 'premium'
    if (lesson.required_tier === 'free') return true
    if (lesson.required_tier === 'pro') return userTier === 'pro' || userTier === 'premium' || userTier === 'max'
    if (lesson.required_tier === 'max') return userTier === 'max' || userTier === 'premium'
    return true
  })()

  if (!loading && lesson && !canAccess) {
    const tierLabel = isInEarlyAccessWindow
      ? 'Max (early access)'
      : lesson.required_tier === 'max'
      ? 'Max'
      : 'Pro'
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

  // Lesson complete screen
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
                Great work! You passed the quiz and finished the lesson. Every completed lesson builds your streak and XP. Keep the momentum going!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
                <Link
                  href="/learn"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
                >
                  <BookOpen className="w-4 h-4" /> Next lesson
                </Link>
                <button
                  onClick={() => {
                    setIsComplete(false)
                    setStepIndex(0)
                    setCheckpointResult('idle')
                    setQuizPhase('lesson')
                    setCurrentQ(0)
                    setQuizAnswers([])
                    setQuizScore(0)
                  }}
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

              {/* Max plan extras */}
              {userTier === 'max' && (
                <div className="flex flex-col sm:flex-row gap-2 justify-center mb-5">
                  <a
                    href={`/learn/${params.slug}/print`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold rounded-md hover:bg-violet-100 transition-colors"
                  >
                    📄 Download Lesson PDF
                  </a>
                  <Link
                    href="/ask-creator"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold rounded-md hover:bg-violet-100 transition-colors"
                  >
                    ✉️ Ask the Creator
                  </Link>
                </div>
              )}
              <div className="border-t border-slate-100 pt-6">
                <ShareCard lessonTitle={lesson.title} steps={steps.length} xp={steps.length * 50} />
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Quiz screen
  if (quizPhase === 'quiz') {
    const quiz = LESSON_QUIZZES[params.slug] || []
    const q = quiz[currentQ]
    if (!q) return null
    const isAnswered = quizAnswers[currentQ] !== null && quizAnswers[currentQ] !== undefined
    const userAnswer = quizAnswers[currentQ]

    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 pt-28 pb-16">
          <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 px-6 py-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Lesson Quiz</p>
              <h2 className="text-lg font-bold text-white">{lesson.title}</h2>
            </div>

            {/* Progress */}
            <div className="px-6 py-3 border-b border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Question {currentQ + 1} of {quiz.length}</span>
                <span className="text-amber-600 font-medium">Need 3/{quiz.length} to pass</span>
              </div>
              <div className="flex gap-1.5">
                {quiz.map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-1.5 rounded-full transition-all ${
                      i < currentQ
                        ? (quizAnswers[i] === quiz[i].correctIndex ? 'bg-green-500' : 'bg-red-400')
                        : i === currentQ
                        ? 'bg-slate-800'
                        : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="p-6">
              {/* Question */}
              <p className="text-base font-semibold text-slate-900 mb-5">{q.question}</p>

              {/* Options */}
              <div className="space-y-2.5 mb-5">
                {q.options.map((option, i) => {
                  const isSelected = userAnswer === i
                  const isCorrectOption = i === q.correctIndex
                  let cls = 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 cursor-pointer'
                  if (isAnswered) {
                    if (isSelected && isCorrectOption) cls = 'border-green-500 bg-green-50 cursor-default'
                    else if (isSelected && !isCorrectOption) cls = 'border-red-400 bg-red-50 cursor-default'
                    else if (!isSelected && isCorrectOption) cls = 'border-green-400 bg-green-50 cursor-default'
                    else cls = 'border-slate-200 bg-slate-50 opacity-50 cursor-default'
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectAnswer(i)}
                      disabled={isAnswered}
                      className={`w-full text-left px-4 py-3 rounded-md border text-sm transition-all flex items-start gap-3 ${cls}`}
                    >
                      <span className={`font-bold text-xs w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                        isAnswered && isCorrectOption ? 'bg-green-500 text-white' :
                        isAnswered && isSelected && !isCorrectOption ? 'bg-red-400 text-white' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {['A', 'B', 'C', 'D'][i]}
                      </span>
                      <span className={`leading-snug ${
                        isAnswered && isCorrectOption ? 'text-green-800 font-medium' :
                        isAnswered && isSelected && !isCorrectOption ? 'text-red-700' :
                        isAnswered ? 'text-slate-400' :
                        'text-slate-700'
                      }`}>{option}</span>
                    </button>
                  )
                })}
              </div>

              {/* Explanation */}
              {isAnswered && (
                <div className={`p-4 rounded-md mb-5 border ${
                  userAnswer === q.correctIndex
                    ? 'bg-green-50 border-green-200'
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <p className={`text-sm font-semibold mb-1 ${userAnswer === q.correctIndex ? 'text-green-800' : 'text-amber-800'}`}>
                    {userAnswer === q.correctIndex ? '✓ Correct!' : '✗ Not quite — the correct answer is highlighted above.'}
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">{q.explanation}</p>
                </div>
              )}

              {/* Next button */}
              {isAnswered && (
                <button
                  onClick={handleQuizNext}
                  className="w-full py-3 bg-slate-900 text-white text-sm font-semibold rounded-md hover:bg-slate-800 transition-colors"
                >
                  {currentQ < quiz.length - 1 ? 'Next Question →' : 'See My Results'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Quiz fail screen
  if (quizPhase === 'quiz-fail') {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 pt-28 pb-16">
          <div className="bg-white border border-slate-200 rounded-md overflow-hidden text-center">
            <div className="bg-amber-50 border-b border-amber-200 px-6 py-8">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                📚
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Not quite there yet</h2>
              <p className="text-slate-600 text-sm">
                You scored <span className="font-bold text-slate-900">{quizScore} out of 5</span>. You need at least 3 to pass.
              </p>
            </div>
            <div className="p-8">
              <p className="text-slate-600 mb-6 text-sm leading-relaxed max-w-sm mx-auto">
                No worries — this is how learning works. Review the lesson summary to lock in the key concepts, then take the quiz again.
              </p>
              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <button
                  onClick={() => setQuizPhase('summary')}
                  className="w-full py-3 bg-slate-900 text-white text-sm font-semibold rounded-md hover:bg-slate-800 transition-colors"
                >
                  📖 Review Lesson Summary
                </button>
                <button
                  onClick={resetQuiz}
                  className="w-full py-3 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors"
                >
                  Retry Quiz
                </button>
                <button
                  onClick={() => { setQuizPhase('lesson'); setStepIndex(0); setCheckpointResult('idle') }}
                  className="text-sm text-slate-400 hover:text-slate-600 transition-colors py-2"
                >
                  ← Go back through the lesson
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Summary screen
  if (quizPhase === 'summary') {
    const summary = LESSON_SUMMARIES[params.slug]
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 pt-28 pb-16">
          <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
            <div className="bg-slate-900 px-6 py-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Lesson Summary</p>
              <h2 className="text-lg font-bold text-white">{lesson.title}</h2>
            </div>
            <div className="p-6">
              {/* What you built */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-md">
                <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="text-base">🔧</span> What you built
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {summary?.whatYouBuilt || 'You completed this lesson and built a working project.'}
                </p>
              </div>

              {/* Key concepts */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="text-base">🧠</span> Key concepts
                </h3>
                <div className="space-y-2.5">
                  {(summary?.keyConcepts || []).map((concept, i) => (
                    <div key={i} className="p-3.5 bg-slate-50 rounded-md border border-slate-100">
                      <p className="text-sm font-semibold text-slate-900">{concept.term}</p>
                      <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{concept.definition}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-slate-100 pt-5 flex flex-col gap-3">
                <button
                  onClick={resetQuiz}
                  className="w-full py-3 bg-slate-900 text-white text-sm font-semibold rounded-md hover:bg-slate-800 transition-colors"
                >
                  Ready — Take the Quiz
                </button>
                <button
                  onClick={() => setQuizPhase('quiz-fail')}
                  className="text-sm text-slate-400 hover:text-slate-600 transition-colors py-1.5 text-center"
                >
                  ← Back
                </button>
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
          <p className="text-sm text-slate-500 mb-3">{lesson.summary}</p>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Wokwi Simulator Button - Pro/Max only */}
            {(userTier === 'pro' || userTier === 'max') && (
              <a
                href="https://wokwi.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <Play className="w-4 h-4" /> Open Wokwi Simulator
              </a>
            )}

            {/* Speed Run - Max only: skip to final step */}
            {userTier === 'max' && quizPhase === 'lesson' && steps.length > 1 && stepIndex < steps.length - 1 && (
              <button
                onClick={() => { setStepIndex(steps.length - 1); setCheckpointResult('idle') }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
                title="Max plan: skip to the final step"
              >
                ⚡ Speed Run
              </button>
            )}
          </div>

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

        {/* Component kit link */}
        <div className="mb-4">
          <ComponentKitLink slug={params.slug} />
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
            {isGuest ? (
              <div className="rounded-md border border-slate-900 bg-slate-900 p-5 text-center">
                <p className="text-white font-semibold mb-1">Create a free account to continue</p>
                <p className="text-slate-400 text-sm mb-4">Track your progress, earn XP, and unlock all {steps.length} steps of this lesson.</p>
                <button
                  onClick={() => setAuthOpen(true)}
                  className="w-full py-2.5 bg-white text-slate-900 text-sm font-semibold rounded-md hover:bg-slate-100 transition-colors"
                >
                  Sign up free — it takes 30 seconds
                </button>
              </div>
            ) : (
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
            )}

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
          {!isGuest && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <button
                  onClick={goBack}
                  disabled={stepIndex === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-slate-300 text-sm text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={saveAndExit}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Save & Exit
                </button>
              </div>
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
          )}
        </div>
      </div>
      {/* AI Tutor - Pro/Max tier only */}
      {(userTier === 'pro' || userTier === 'max') && <AiTutor />}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </main>
  )
}
