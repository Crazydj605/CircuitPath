'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, CalendarDays, Clock, Flame, Trophy } from 'lucide-react'
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
      const dashboardData = await getDashboardData()
      setLessons(dashboardData.lessons)
      setStreak(dashboardData.streak)
      setLoading(false)
    }

    bootstrap()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const completedLessons = lessons.filter((lesson) => lesson.progress?.status === 'completed')
  const inProgress = lessons.find((lesson) => lesson.progress?.status === 'in_progress')
  const recommended = inProgress || lessons.find((lesson) => !lesson.progress || lesson.progress.status !== 'completed') || null

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome back, {user?.email?.split('@')[0] || 'Learner'}
            </h1>
            <p className="text-slate-500">
              Keep things simple: one lesson step today is enough to stay consistent.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-white border border-slate-200 rounded">
              <p className="text-sm text-slate-500">Lessons completed</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{completedLessons.length}</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded">
              <p className="text-sm text-slate-500">Current streak</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{streak?.current_streak_days ?? 0} day(s)</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded">
              <p className="text-sm text-slate-500">Longest streak</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{streak?.longest_streak_days ?? 0} day(s)</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded">
              <p className="text-sm text-slate-500">Available lessons</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{lessons.length}</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded border border-slate-200 bg-white p-5">
                <h2 className="text-xl font-semibold text-slate-900">Resume or Start Here!</h2>
                {recommended ? (
                  <div className="mt-3">
                    <p className="text-sm text-slate-500">Recommended now</p>
                    <h3 className="mt-1 text-lg font-medium text-slate-900">{recommended.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{recommended.summary}</p>
                    <div className="mt-4 flex items-center gap-3">
                      <Link href={`/learn/${recommended.slug}`} className="rounded bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800">
                        {recommended.progress?.status === 'in_progress' ? 'Continue lesson' : 'Start lesson'}
                      </Link>
                      <Link href="/learn" className="text-sm text-slate-600 hover:text-slate-900">
                        View all lessons
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-600">No lesson data yet. Run the migration seed and refresh.</p>
                )}
              </div>

              <div className="rounded border border-slate-200 bg-white p-5">
                <h2 className="text-lg font-semibold text-slate-900">Today&apos;s Challenge🔥</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Complete one checkpoint in your guided lesson. This keeps your streak alive and builds real confidence.
                </p>
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                  <CalendarDays className="h-4 w-4" />
                  Local timezone streak tracking is active.
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-900">Streak status</h3>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p className="flex items-center gap-2"><Flame className="h-4 w-4 text-slate-700" /> Current: {streak?.current_streak_days ?? 0} day(s)</p>
                  <p className="flex items-center gap-2"><Trophy className="h-4 w-4 text-slate-700" /> Best: {streak?.longest_streak_days ?? 0} day(s)</p>
                  <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-slate-700" /> Last activity: {streak?.last_activity_date || 'Not yet'}</p>
                </div>
              </div>

              <div className="rounded border border-slate-200 bg-white p-5">
                <h3 className="text-sm font-semibold text-slate-900">Quick links</h3>
                <div className="mt-3 space-y-2">
                  <Link href="/learn" className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900"><BookOpen className="h-4 w-4" /> Open lesson library</Link>
                  <Link href="/settings" className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900"><CalendarDays className="h-4 w-4" /> Update learning preferences</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
