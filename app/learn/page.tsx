'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, CheckCircle2, Clock, Play, Lock, Zap, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { getLessonLibrary, getPublicLessons } from '@/lib/learning'
import type { LearningLesson, LearningUserLessonProgress } from '@/types'

function difficultyStyle(difficulty: string) {
  switch (difficulty?.toLowerCase()) {
    case 'beginner': return { bar: 'bg-green-500', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' }
    case 'intermediate': return { bar: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' }
    case 'advanced': return { bar: 'bg-red-500', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' }
    default: return { bar: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' }
  }
}

export default function Learn() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userTier, setUserTier] = useState<string>('free')
  const [loading, setLoading] = useState(true)
  const [lessons, setLessons] = useState<Array<LearningLesson & { progress: LearningUserLessonProgress | null }>>([])
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'not_started' | 'completed'>('all')

  useEffect(() => {
    const bootstrap = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
        const [library, profileResult] = await Promise.all([
          getLessonLibrary(),
          supabase.from('profiles').select('subscription_tier').eq('id', session.user.id).maybeSingle(),
        ])
        setLessons(library)
        setUserTier(profileResult.data?.subscription_tier || 'free')
      } else {
        const publicLessons = await getPublicLessons()
        setLessons(publicLessons)
      }
      setLoading(false)
    }
    bootstrap()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
      </div>
    )
  }

  const completedCount = lessons.filter(l => l.progress?.status === 'completed').length
  const inProgressCount = lessons.filter(l => l.progress?.status === 'in_progress').length

  const filtered = filter === 'all' ? lessons : lessons.filter(l => {
    const s = l.progress?.status ?? 'not_started'
    return s === filter
  })

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-20 pb-16">

        {/* Guest sign-up banner */}
        {!user && (
          <div className="bg-slate-900 px-4 py-3">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
              <p className="text-sm text-slate-300">
                <span className="text-white font-medium">Sign up free</span> to track your progress, earn XP, and keep your streak.
              </p>
              <a
                href="/"
                className="shrink-0 px-4 py-1.5 bg-white text-slate-900 text-sm font-semibold rounded hover:bg-slate-100 transition-colors"
              >
                Get Started
              </a>
            </div>
          </div>
        )}

        {/* Header banner */}
        <div className="bg-white border-b border-slate-200 px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Lesson Library</h1>
            <p className="text-slate-500 text-sm">Step-by-step lessons made for beginners. Work at your own pace.</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 mt-6">

          {/* Progress bar + stats */}
          {user && lessons.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-md p-5 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-slate-600">{completedCount} completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full" />
                    <span className="text-slate-600">{inProgressCount} in progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-200 rounded-full" />
                    <span className="text-slate-400">{lessons.length - completedCount - inProgressCount} not started</span>
                  </div>
                </div>
                <span className="text-sm font-medium text-slate-500">
                  {Math.round((completedCount / lessons.length) * 100)}% complete
                </span>
              </div>
              <div className="mt-3 w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-slate-800 h-2 rounded-full transition-all"
                  style={{ width: `${(completedCount / lessons.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Filter tabs — authenticated users only */}
          {user && <div className="flex items-center gap-1 mb-5 bg-white border border-slate-200 rounded-md p-1 w-fit">
            {([
              { key: 'all', label: 'All' },
              { key: 'in_progress', label: 'In Progress' },
              { key: 'not_started', label: 'Not Started' },
              { key: 'completed', label: 'Completed' },
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                  filter === tab.key
                    ? 'bg-slate-900 text-white font-medium'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>}

          {/* Lesson grid */}
          {filtered.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((lesson, idx) => {
                const status = lesson.progress?.status ?? 'not_started'
                const isCompleted = status === 'completed'
                const isInProgress = status === 'in_progress'
                const tierRequired = lesson.required_tier
                const isLocked = (() => {
                  if (tierRequired === 'free') return false
                  if (tierRequired === 'pro') return !['pro', 'premium', 'max'].includes(userTier)
                  if (tierRequired === 'max') return !['max', 'premium'].includes(userTier)
                  return false
                })()
                const tierLabel = tierRequired === 'max' ? 'Max' : 'Pro'
                const styles = difficultyStyle(lesson.difficulty)

                return (
                  <Link
                    key={lesson.id}
                    href={`/learn/${lesson.slug}`}
                    className={`group relative bg-white border rounded-md overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                      isLocked
                        ? 'border-slate-200 opacity-80'
                        : isInProgress
                        ? 'border-slate-800 shadow-sm'
                        : isCompleted
                        ? 'border-green-200'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {/* Difficulty color strip */}
                    <div className={`h-1 w-full ${isCompleted ? 'bg-green-400' : isLocked ? 'bg-slate-300' : styles.bar}`} />

                    <div className="p-5">
                      {/* Top row */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${isLocked ? 'bg-slate-100 text-slate-400' : styles.badge}`}>
                            {lesson.difficulty}
                          </span>
                          {isLocked && (
                            <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                              <Lock className="w-3 h-3" /> {tierLabel}
                            </span>
                          )}
                        </div>
                        {isCompleted && !isLocked && (
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                          </div>
                        )}
                        {isInProgress && !isLocked && (
                          <span className="text-xs bg-slate-900 text-white px-2 py-0.5 rounded font-medium">
                            In progress
                          </span>
                        )}
                      </div>

                      {/* Lesson number + title */}
                      <div className="flex items-start gap-3 mb-2">
                        <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                          isLocked ? 'bg-slate-100' : isCompleted ? 'bg-green-100' : isInProgress ? 'bg-slate-900' : 'bg-slate-100'
                        }`}>
                          {isLocked
                            ? <Lock className="w-3.5 h-3.5 text-slate-400" />
                            : <span className={`text-xs font-bold ${isCompleted ? 'text-green-700' : isInProgress ? 'text-white' : 'text-slate-600'}`}>{idx + 1}</span>
                          }
                        </div>
                        <div>
                          <h3 className={`text-base font-semibold leading-snug mb-1 ${isLocked ? 'text-slate-400' : isCompleted ? 'text-slate-500' : 'text-slate-900'}`}>
                            {lesson.title}
                          </h3>
                          <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
                            {lesson.summary}
                          </p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {lesson.estimated_minutes} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3" /> +{(idx + 1) * 100} XP
                          </span>
                        </div>
                        <div className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                          isLocked
                            ? 'text-amber-600'
                            : isCompleted
                            ? 'text-green-600'
                            : 'text-slate-700 group-hover:text-slate-900'
                        }`}>
                          {isLocked ? (
                            <><Lock className="w-4 h-4" /> Upgrade to unlock</>
                          ) : isCompleted ? (
                            <><CheckCircle2 className="w-4 h-4" /> Done</>
                          ) : isInProgress ? (
                            <><Play className="w-4 h-4 fill-slate-700" /> Continue</>
                          ) : (
                            <><ArrowRight className="w-4 h-4" /> Start</>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-md p-10 text-center">
              <BookOpen className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              {filter !== 'all' ? (
                <>
                  <p className="text-slate-500 mb-2">No lessons match this filter.</p>
                  <button onClick={() => setFilter('all')} className="text-sm text-slate-700 underline underline-offset-2">
                    Show all lessons
                  </button>
                </>
              ) : (
                <>
                  <p className="text-slate-500 mb-1">No lessons available yet.</p>
                  <p className="text-xs text-slate-400">Run the Supabase migration to seed lessons, then refresh.</p>
                </>
              )}
            </div>
          )}

          {/* Coming Soon section */}
          {filter === 'all' && (
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Coming Soon</h2>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: 'RGB LED Colors', summary: 'Mix red, green, and blue to produce any color. Learn PWM on three channels and build a color cycle effect.', difficulty: 'beginner', minutes: 20 },
                  { title: 'Buzzer & Tones', summary: 'Generate notes and melodies using the tone() function. Build a musical doorbell and play the birthday song.', difficulty: 'intermediate', minutes: 25 },
                  { title: 'Ultrasonic Distance Sensor', summary: 'Measure distance in real time with an HC-SR04. Build a proximity alarm that beeps faster as objects get closer.', difficulty: 'intermediate', minutes: 30 },
                ].map(lesson => (
                  <div
                    key={lesson.title}
                    className="group relative bg-white border border-dashed border-slate-300 rounded-md overflow-hidden opacity-60"
                  >
                    <div className="h-1 w-full bg-slate-200" />
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-400">
                          {lesson.difficulty}
                        </span>
                        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          Coming Soon
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-slate-400 mb-1">{lesson.title}</h3>
                      <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">{lesson.summary}</p>
                      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-300">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {lesson.minutes} min</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upgrade nudge for free users */}
          {userTier === 'free' && (
            <div className="mt-8 bg-slate-900 rounded-md p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div>
                <p className="text-white font-semibold mb-1">Unlock the full curriculum</p>
                <p className="text-slate-400 text-sm">Pro unlocks all lessons, plus every new lesson added each month.</p>
              </div>
              <Link
                href="/pricing"
                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 rounded-md text-sm font-semibold hover:bg-slate-100 transition-colors"
              >
                <Zap className="w-4 h-4 text-amber-500" />
                Upgrade to Pro
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
