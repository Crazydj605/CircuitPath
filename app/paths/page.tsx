'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle2, Lock, Zap, BookOpen } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { getLessonLibrary, getPublicLessons } from '@/lib/learning'

type PathLesson = {
  slug: string
  title: string
  required_tier: string
  completed: boolean
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
    description: 'Start here if you\'ve never touched an Arduino. Learn the basics step by step.',
    icon: '🌱',
    color: 'green',
    slugs: ['blink-led', 'button-input', 'pwm-fade-led'],
  },
  {
    id: 'sensors-input',
    title: 'Sensors & Input',
    description: 'Learn to read real-world signals with buttons, knobs, and sensors.',
    icon: '🔭',
    color: 'blue',
    slugs: ['button-input', 'analog-sensor', 'serial-monitor'],
  },
  {
    id: 'motion-sound',
    title: 'Motion & Sound',
    description: 'Make things move and communicate with servo motors and serial output.',
    icon: '⚡',
    color: 'amber',
    slugs: ['servo-motor', 'serial-monitor'],
  },
]

const COLOR_STYLES: Record<string, { bg: string; border: string; badge: string; bar: string; btn: string }> = {
  green:  { bg: 'bg-green-50',  border: 'border-green-200',  badge: 'bg-green-100 text-green-700',  bar: 'bg-green-500',  btn: 'bg-green-700 hover:bg-green-800' },
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700',   bar: 'bg-blue-500',   btn: 'bg-blue-700 hover:bg-blue-800' },
  amber:  { bg: 'bg-amber-50',  border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-700',  bar: 'bg-amber-500',  btn: 'bg-amber-600 hover:bg-amber-700' },
}

export default function PathsPage() {
  const router = useRouter()
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)
  const [userTier, setUserTier] = useState<string>('free')

  useEffect(() => {
    const bootstrap = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      let lessonMap: Map<string, { completed: boolean; required_tier: string; title: string }> = new Map()

      if (!session) {
        setIsGuest(true)
        const publicLessons = await getPublicLessons()
        for (const l of publicLessons) {
          lessonMap.set(l.slug, { completed: false, required_tier: l.required_tier, title: l.title })
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

      <div className="mx-auto max-w-3xl px-4 pt-28 pb-16">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Learning Paths</h1>
          <p className="text-slate-500 text-sm">
            Structured paths that guide you through lessons in the right order. Free to follow — Pro unlocks every lesson inside.
          </p>
        </div>

        <div className="space-y-6">
          {paths.map(path => {
            const styles = COLOR_STYLES[path.color]
            const completedCount = path.lessons.filter(l => l.completed).length
            const pct = Math.round((completedCount / path.lessons.length) * 100)
            const nextLesson = path.lessons.find(l => !l.completed)
            const isComplete = completedCount === path.lessons.length

            return (
              <div key={path.id} className="bg-white border border-slate-200 rounded-md overflow-hidden">
                {/* Path header */}
                <div className={`${styles.bg} ${styles.border} border-b px-6 py-5`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl leading-none mt-0.5">{path.icon}</span>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-1">{path.title}</h2>
                        <p className="text-sm text-slate-600">{path.description}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${styles.badge}`}>
                      {completedCount}/{path.lessons.length} done
                    </span>
                  </div>

                  {!isGuest && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                        <span>Progress</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="w-full bg-white/70 rounded-full h-2">
                        <div
                          className={`${styles.bar} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Lesson list */}
                <div className="divide-y divide-slate-100">
                  {path.lessons.map((lesson, idx) => {
                    const isLocked = lesson.required_tier !== 'free' && !isPro
                    return (
                      <div key={lesson.slug} className="flex items-center gap-4 px-6 py-4">
                        {/* Step number / check */}
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                          lesson.completed
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                          {lesson.completed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>

                        {/* Lesson title */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isLocked ? 'text-slate-400' : 'text-slate-800'}`}>
                            {lesson.title}
                          </p>
                          {lesson.completed && (
                            <p className="text-xs text-green-600 mt-0.5">Completed</p>
                          )}
                        </div>

                        {/* Action */}
                        {isLocked ? (
                          <span className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
                            <Lock className="w-3 h-3" /> Pro
                          </span>
                        ) : (
                          <Link
                            href={`/learn/${lesson.slug}`}
                            className="shrink-0 flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                          >
                            {lesson.completed ? 'Review' : 'Start'} <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* CTA footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
                  {isComplete ? (
                    <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Path complete!
                    </div>
                  ) : nextLesson && !isGuest ? (
                    <>
                      <p className="text-xs text-slate-500">
                        Next up: <span className="font-medium text-slate-700">{nextLesson.title}</span>
                      </p>
                      <Link
                        href={`/learn/${nextLesson.slug}`}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 text-white text-xs font-semibold rounded-md transition-colors ${styles.btn}`}
                      >
                        Continue path <ArrowRight className="w-3 h-3" />
                      </Link>
                    </>
                  ) : isGuest ? (
                    <Link
                      href="/"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 transition-colors"
                    >
                      Sign up to track progress <ArrowRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 transition-colors"
                    >
                      <Zap className="w-3 h-3" /> Unlock all lessons
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
