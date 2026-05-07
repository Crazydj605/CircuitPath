'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, CalendarDays, Clock, Flame, Trophy, Zap, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { getDashboardData } from '@/lib/learning'
import type { LearningLesson, LearningUserLessonProgress, LearningUserStreak } from '@/types'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lessons, setLessons] = useState<Array<LearningLesson & { progress: LearningUserLessonProgress | null }>>([])
  const [streak, setStreak] = useState<LearningUserStreak | null>(null)

  useEffect(() => {
    const bootstrap = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
        return
      }
      setUser(session.user)
      const data = await getDashboardData()
      setLessons(data.lessons)
      setStreak(data.streak)
      setLoading(false)
    }
    bootstrap()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const completedLessons = lessons.filter((l) => l.progress?.status === 'completed')
  const inProgress = lessons.find((l) => l.progress?.status === 'in_progress')
  const recommended =
    inProgress ||
    lessons.find((l) => !l.progress || l.progress.status !== 'completed') ||
    null

  const username = user?.email?.split('@')[0] || 'Learner'

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-1">
              Welcome back, {username}
            </h1>
            <p className="text-slate-500 text-sm">
              One lesson step today is enough to stay consistent.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Lessons completed', value: completedLessons.length, icon: BookOpen },
              { label: 'Current streak', value: `${streak?.current_streak_days ?? 0} day${streak?.current_streak_days !== 1 ? 's' : ''}`, icon: Flame },
              { label: 'Longest streak', value: `${streak?.longest_streak_days ?? 0} day${streak?.longest_streak_days !== 1 ? 's' : ''}`, icon: Trophy },
              { label: 'Total lessons', value: lessons.length, icon: Zap },
            ].map((stat) => (
              <div key={stat.label} className="p-5 bg-white border border-slate-200 rounded-md">
                <div className="flex items-center gap-2 mb-3">
                  <stat.icon className="w-4 h-4 text-slate-400" />
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-5 lg:grid-cols-3">

            {/* Main column */}
            <div className="lg:col-span-2 space-y-5">

              {/* Resume card */}
              <div className="bg-white border border-slate-200 rounded-md p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  {recommended?.progress?.status === 'in_progress' ? 'Continue where you left off' : 'Start your next lesson'}
                </h2>
                {recommended ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {recommended.difficulty}
                      </span>
                      <span className="text-xs text-slate-400">{recommended.estimated_minutes} min</span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mb-1">{recommended.title}</h3>
                    <p className="text-sm text-slate-500 mb-5 leading-relaxed">{recommended.summary}</p>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/learn/${recommended.slug}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
                      >
                        {recommended.progress?.status === 'in_progress' ? 'Continue lesson' : 'Start lesson'}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        href="/learn"
                        className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
                      >
                        View all lessons
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    No lessons available yet. Check back soon or visit the{' '}
                    <Link href="/learn" className="text-slate-700 underline underline-offset-2">lesson library</Link>.
                  </p>
                )}
              </div>

              {/* Daily challenge */}
              <div className="bg-white border border-slate-200 rounded-md p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="h-5 w-5 text-amber-500" />
                  <h2 className="text-base font-semibold text-slate-900">Daily Challenge</h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Complete one checkpoint in your guided lesson. This keeps your streak alive and
                  builds real confidence over time.
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Streak tracking uses your local timezone.
                </div>
              </div>

              {/* Recent lessons */}
              {completedLessons.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-md p-6">
                  <h2 className="text-base font-semibold text-slate-900 mb-4">Completed lessons</h2>
                  <div className="space-y-3">
                    {completedLessons.slice(0, 4).map((lesson) => (
                      <Link
                        key={lesson.id}
                        href={`/learn/${lesson.slug}`}
                        className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded hover:bg-slate-100 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900">{lesson.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{lesson.estimated_minutes} min · {lesson.difficulty}</p>
                        </div>
                        <span className="text-xs text-slate-400 bg-white border border-slate-200 px-2 py-1 rounded">
                          Done
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">

              {/* Streak card */}
              <div className="bg-white border border-slate-200 rounded-md p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Streak status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Flame className="h-4 w-4 text-amber-500" />
                      Current streak
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {streak?.current_streak_days ?? 0}d
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Trophy className="h-4 w-4 text-slate-500" />
                      Best streak
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {streak?.longest_streak_days ?? 0}d
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock className="h-4 w-4" />
                      Last activity
                    </div>
                    <span className="text-xs text-slate-400">
                      {streak?.last_activity_date || 'None yet'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick links */}
              <div className="bg-white border border-slate-200 rounded-md p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Quick links</h3>
                <div className="space-y-1">
                  <Link
                    href="/learn"
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded transition-colors"
                  >
                    <BookOpen className="h-4 w-4 text-slate-400" />
                    Open lesson library
                  </Link>
                  <Link
                    href="/community"
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded transition-colors"
                  >
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    Community
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded transition-colors"
                  >
                    <Zap className="h-4 w-4 text-slate-400" />
                    Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
