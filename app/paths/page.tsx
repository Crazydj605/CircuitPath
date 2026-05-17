'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Lock, Zap, Play, Star } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { getLessonLibrary, getPublicLessons } from '@/lib/learning'

type PathLesson = {
  slug: string
  title: string
  required_tier: string
  completed: boolean
  estimated_minutes?: number
}

type LearningPath = {
  id: string
  title: string
  description: string
  icon: string
  color: string
  lessons: PathLesson[]
}

const PATH_DEFINITIONS = [
  {
    id: 'complete-beginner',
    title: 'Complete Beginner',
    description: "Start here if you've never touched an Arduino.",
    icon: '🌱',
    color: 'green',
    slugs: ['blink-led', 'button-input', 'pwm-fade-led'],
  },
  {
    id: 'sensors-input',
    title: 'Sensors & Input',
    description: 'Read real-world signals with buttons, knobs, and sensors.',
    icon: '🔭',
    color: 'blue',
    slugs: ['button-input', 'analog-sensor', 'serial-monitor'],
  },
  {
    id: 'motion-sound',
    title: 'Motion & Sound',
    description: 'Make things move and talk back via the serial monitor.',
    icon: '⚡',
    color: 'amber',
    slugs: ['servo-motor', 'serial-monitor'],
  },
]

const COLOR_STYLES: Record<
  string,
  {
    headerBg: string
    headerBorder: string
    badge: string
    progressBar: string
    nodeDone: string
    nodeCurrent: string
    nodeLocked: string
    nodeFuture: string
    line: string
  }
> = {
  green: {
    headerBg: 'bg-green-50',
    headerBorder: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
    progressBar: 'bg-green-500',
    nodeDone: 'bg-green-500 text-white ring-green-200',
    nodeCurrent: 'bg-green-600 text-white ring-green-300 shadow-lg shadow-green-500/30',
    nodeLocked: 'bg-slate-200 text-slate-400 ring-slate-100',
    nodeFuture: 'bg-white text-green-700 ring-green-200',
    line: 'bg-green-200',
  },
  blue: {
    headerBg: 'bg-blue-50',
    headerBorder: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    progressBar: 'bg-blue-500',
    nodeDone: 'bg-blue-500 text-white ring-blue-200',
    nodeCurrent: 'bg-blue-600 text-white ring-blue-300 shadow-lg shadow-blue-500/30',
    nodeLocked: 'bg-slate-200 text-slate-400 ring-slate-100',
    nodeFuture: 'bg-white text-blue-700 ring-blue-200',
    line: 'bg-blue-200',
  },
  amber: {
    headerBg: 'bg-amber-50',
    headerBorder: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    progressBar: 'bg-amber-500',
    nodeDone: 'bg-amber-500 text-white ring-amber-200',
    nodeCurrent: 'bg-amber-600 text-white ring-amber-300 shadow-lg shadow-amber-500/30',
    nodeLocked: 'bg-slate-200 text-slate-400 ring-slate-100',
    nodeFuture: 'bg-white text-amber-700 ring-amber-200',
    line: 'bg-amber-200',
  },
}

export default function PathsPage() {
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)
  const [userTier, setUserTier] = useState<string>('free')

  useEffect(() => {
    const bootstrap = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      let lessonMap: Map<string, { completed: boolean; required_tier: string; title: string; minutes?: number }> = new Map()

      if (!session) {
        setIsGuest(true)
        const publicLessons = await getPublicLessons()
        for (const l of publicLessons) {
          lessonMap.set(l.slug, {
            completed: false,
            required_tier: l.required_tier,
            title: l.title,
            minutes: l.estimated_minutes,
          })
        }
      } else {
        const [library, profileResult] = await Promise.all([
          getLessonLibrary(),
          supabase.from('profiles').select('subscription_tier').eq('id', session.user.id).maybeSingle(),
        ])
        setUserTier(profileResult.data?.subscription_tier || 'free')
        for (const l of library) {
          lessonMap.set(l.slug, {
            completed: l.progress?.status === 'completed',
            required_tier: l.required_tier,
            title: l.title,
            minutes: l.estimated_minutes,
          })
        }
      }

      const built = PATH_DEFINITIONS.map(def => ({
        id: def.id,
        title: def.title,
        description: def.description,
        icon: def.icon,
        color: def.color,
        lessons: def.slugs.map(slug => {
          const info = lessonMap.get(slug)
          return {
            slug,
            title: info?.title || slug,
            required_tier: info?.required_tier || 'free',
            completed: info?.completed || false,
            estimated_minutes: info?.minutes,
          }
        }),
      }))

      setPaths(built)
      setLoading(false)
    }
    bootstrap()
  }, [])

  const isPro = userTier === 'pro' || userTier === 'premium' || userTier === 'max'

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

      {isGuest && (
        <div className="bg-slate-900 text-white text-sm py-2.5 px-4 text-center">
          Sign up free to track your progress through these paths.{' '}
          <Link href="/" className="font-semibold underline underline-offset-2 hover:text-amber-300 transition-colors">
            Get Started
          </Link>
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Learning Path</h1>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Climb the path one lesson at a time. Each circle unlocks the next. Free to follow — Pro unlocks every step.
          </p>
        </div>

        <div className="space-y-12">
          {paths.map((path) => {
            const styles = COLOR_STYLES[path.color]
            const completedCount = path.lessons.filter((l) => l.completed).length
            const total = path.lessons.length
            const pct = Math.round((completedCount / total) * 100)
            const nextIdx = path.lessons.findIndex((l) => !l.completed)

            return (
              <section key={path.id} className="bg-white border border-slate-200 rounded-md overflow-hidden">
                {/* Header */}
                <div className={`${styles.headerBg} ${styles.headerBorder} border-b px-6 py-5`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl leading-none mt-0.5">{path.icon}</span>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-0.5">{path.title}</h2>
                        <p className="text-sm text-slate-600">{path.description}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${styles.badge}`}>
                      {completedCount}/{total}
                    </span>
                  </div>

                  {!isGuest && (
                    <div className="mt-4">
                      <div className="w-full bg-white/70 rounded-full h-2">
                        <div
                          className={`${styles.progressBar} h-2 rounded-full transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Zigzag path */}
                <div className="relative px-6 py-8">
                  <div className="relative flex flex-col items-center">
                    {path.lessons.map((lesson, idx) => {
                      const isLocked = lesson.required_tier !== 'free' && !isPro
                      const isCurrent = idx === nextIdx && !lesson.completed && !isLocked
                      const offsetX = idx % 2 === 0 ? '-translate-x-12' : 'translate-x-12'
                      const nodeClass = lesson.completed
                        ? styles.nodeDone
                        : isLocked
                        ? styles.nodeLocked
                        : isCurrent
                        ? styles.nodeCurrent
                        : styles.nodeFuture

                      return (
                        <div key={lesson.slug} className="relative w-full flex flex-col items-center">
                          {/* Connector line above (except first) */}
                          {idx > 0 && (
                            <div className={`w-1 h-12 ${styles.line} -mb-1 rounded-full opacity-70`} />
                          )}

                          <div className={`flex items-center gap-4 ${offsetX} transition-transform`}>
                            {/* The node */}
                            {isLocked ? (
                              <div
                                className={`w-16 h-16 rounded-full flex items-center justify-center ring-4 ${nodeClass} cursor-not-allowed`}
                                title="Locked — upgrade to Pro"
                              >
                                <Lock className="w-6 h-6" />
                              </div>
                            ) : (
                              <Link
                                href={`/learn/${lesson.slug}`}
                                className={`w-16 h-16 rounded-full flex items-center justify-center ring-4 transition-transform hover:scale-105 ${nodeClass}`}
                                title={lesson.title}
                              >
                                {lesson.completed ? (
                                  <CheckCircle2 className="w-7 h-7" />
                                ) : isCurrent ? (
                                  <Play className="w-6 h-6 ml-0.5" />
                                ) : (
                                  <Star className="w-6 h-6" />
                                )}
                              </Link>
                            )}

                            {/* Tooltip label */}
                            <div className="pointer-events-none">
                              <p
                                className={`text-sm font-semibold ${
                                  isLocked ? 'text-slate-400' : 'text-slate-900'
                                }`}
                              >
                                {lesson.title}
                                {lesson.completed && (
                                  <span className="ml-2 text-xs text-green-600 font-normal">✓ Done</span>
                                )}
                                {isCurrent && (
                                  <span className="ml-2 text-xs text-slate-500 font-normal">← Next up</span>
                                )}
                                {isLocked && (
                                  <span className="ml-2 text-xs text-slate-400 font-normal">Pro</span>
                                )}
                              </p>
                              {lesson.estimated_minutes && (
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {lesson.estimated_minutes} min
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {/* Goal / trophy node */}
                    <div className={`w-1 h-12 ${styles.line} -mb-1 rounded-full opacity-70`} />
                    <div
                      className={`w-20 h-20 rounded-full bg-amber-100 ring-4 ring-amber-200 flex items-center justify-center`}
                    >
                      <span className="text-3xl">🏆</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-600 mt-2">
                      {completedCount === total ? 'Path complete!' : 'Finish the path'}
                    </p>
                  </div>

                  {/* CTA at bottom */}
                  {!isGuest && nextIdx !== -1 && (
                    <div className="mt-8 text-center">
                      {path.lessons[nextIdx].required_tier !== 'free' && !isPro ? (
                        <Link
                          href="/pricing"
                          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-md hover:bg-slate-800 transition-colors"
                        >
                          <Zap className="w-3.5 h-3.5" /> Unlock with Pro
                        </Link>
                      ) : (
                        <Link
                          href={`/learn/${path.lessons[nextIdx].slug}`}
                          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-md hover:bg-slate-800 transition-colors"
                        >
                          <Play className="w-3.5 h-3.5" /> Continue path
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </main>
  )
}
