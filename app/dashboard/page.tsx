'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Flame, Trophy, ArrowRight, CheckCircle2, Clock, Zap, BarChart2, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { getDashboardData } from '@/lib/learning'
import { getRank, getNextRank, getProgressPercent } from '@/lib/xp'
import type { LearningLesson, LearningUserLessonProgress, LearningUserStreak } from '@/types'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lessons, setLessons] = useState<Array<LearningLesson & { progress: LearningUserLessonProgress | null }>>([])
  const [streak, setStreak] = useState<LearningUserStreak | null>(null)
  const [xp, setXp] = useState(0)

  useEffect(() => {
    const bootstrap = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }
      setUser(session.user)
      const data = await getDashboardData()
      setLessons(data.lessons)
      setStreak(data.streak)
      setXp(data.xp)
      setLoading(false)

      // Always show tour for the owner account; show once for new users
      if (session.user.email === 'dominictocco20@gmail.com') {
        setTimeout(() => window.dispatchEvent(new Event('cp:start-tour')), 1200)
      } else if (!localStorage.getItem('cp_tour_done') && !localStorage.getItem('cp_tour_step')) {
        setTimeout(() => window.dispatchEvent(new Event('cp:start-tour')), 1200)
      }
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

  const completed = lessons.filter(l => l.progress?.status === 'completed')
  const inProgress = lessons.find(l => l.progress?.status === 'in_progress')
  const recommended = inProgress || lessons.find(l => !l.progress || l.progress.status !== 'completed') || null
  const username = user?.email?.split('@')[0] || 'Learner'
  const currentStreak = streak?.current_streak_days ?? 0
  const bestStreak = streak?.longest_streak_days ?? 0
  const rank = getRank(xp)
  const nextRank = getNextRank(xp)
  const progressPct = getProgressPercent(xp)

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-20 pb-16">

        {/* Hero banner */}
        <div className="bg-slate-900 px-4 py-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-slate-400 text-sm mb-1">Good to see you back</p>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {username}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                {currentStreak > 0 ? (
                  <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-md">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-300 text-sm font-medium">{currentStreak} day streak</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-md">
                    <Flame className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-400 text-sm">Start your streak today</span>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-md">
                  <CheckCircle2 className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300 text-sm">{completed.length} lesson{completed.length !== 1 ? 's' : ''} done</span>
                </div>
              </div>
            </div>
            <Link
              href="/learn"
              className="inline-flex items-center gap-2 px-5 py-3 bg-white text-slate-900 rounded-md font-medium text-sm hover:bg-slate-100 transition-colors shrink-0"
            >
              <BookOpen className="w-4 h-4" />
              Browse all lessons
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 mt-8">

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: CheckCircle2, label: 'Completed', value: completed.length, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
              { icon: Flame, label: 'Current streak', value: `${currentStreak}d`, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200' },
              { icon: Trophy, label: 'Best streak', value: `${bestStreak}d`, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
              { icon: BookOpen, label: 'Total lessons', value: lessons.length, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
            ].map(stat => (
              <div key={stat.label} className={`p-4 bg-white border rounded-md flex items-center gap-3 ${stat.bg}`}>
                <div className={`w-9 h-9 rounded flex items-center justify-center ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                  <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">

            {/* Main column */}
            <div className="lg:col-span-2 space-y-5">

              {/* Resume / next lesson — hero card */}
              {recommended ? (
                <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
                  <div className="p-1.5 bg-slate-900">
                    <p className="text-center text-xs text-slate-400">
                      {recommended.progress?.status === 'in_progress' ? 'Continue where you left off' : 'Recommended next lesson'}
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        recommended.difficulty === 'beginner'
                          ? 'bg-green-100 text-green-700'
                          : recommended.difficulty === 'intermediate'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {recommended.difficulty}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {recommended.estimated_minutes} min
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">{recommended.title}</h2>
                    <p className="text-sm text-slate-500 mb-5 leading-relaxed">{recommended.summary}</p>
                    <Link
                      href={`/learn/${recommended.slug}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
                    >
                      {recommended.progress?.status === 'in_progress' ? 'Continue lesson' : 'Start lesson'}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-md p-6 text-center">
                  <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
                  <p className="font-semibold text-slate-900 mb-1">All lessons complete!</p>
                  <p className="text-sm text-slate-500">New content is on the way. Check back soon.</p>
                </div>
              )}

              {/* Daily challenge card */}
              <div className="bg-white border border-slate-200 rounded-md p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-amber-100 rounded flex items-center justify-center shrink-0">
                    <Flame className="w-5 h-5 text-amber-500" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Daily Challenge</h3>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">
                  Complete one checkpoint in your lesson today. That's it — one step keeps your streak alive and builds real confidence over time.
                </p>
                {recommended && (
                  <Link
                    href={`/learn/${recommended.slug}`}
                    className="inline-flex items-center gap-2 text-sm text-slate-700 font-medium hover:text-slate-900 transition-colors"
                  >
                    Go to today's lesson <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {/* Completed lessons */}
              {completed.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-md p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900">Completed lessons</h3>
                    <span className="text-xs text-slate-400">{completed.length} total</span>
                  </div>
                  <div className="space-y-2">
                    {completed.slice(0, 5).map(lesson => (
                      <Link
                        key={lesson.id}
                        href={`/learn/${lesson.slug}`}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-md hover:bg-slate-100 transition-colors group"
                      >
                        <div className="w-7 h-7 bg-green-100 rounded flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{lesson.title}</p>
                          <p className="text-xs text-slate-400">{lesson.estimated_minutes} min · {lesson.difficulty}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">

              {/* XP Rank card */}
              <div className="bg-white border border-slate-200 rounded-md p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <h3 className="font-semibold text-slate-900">XP & Rank</h3>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${rank.bg} ${rank.color}`}>
                    {rank.name}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-3xl font-bold text-slate-900">{xp}</span>
                  <span className="text-sm text-slate-400">XP</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all ${rank.bar}`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                {nextRank ? (
                  <p className="text-xs text-slate-400">
                    {nextRank.minXp - xp} XP to <span className={`font-medium ${nextRank.color}`}>{nextRank.name}</span>
                  </p>
                ) : (
                  <p className="text-xs text-amber-600 font-medium">Max rank reached!</p>
                )}
              </div>

              {/* Streak card */}
              <div className="bg-white border border-slate-200 rounded-md p-5">
                <div className="flex items-center gap-2 mb-5">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-slate-900">Streak</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-md text-center">
                    <p className="text-2xl font-bold text-amber-600">{currentStreak}</p>
                    <p className="text-xs text-amber-500 mt-0.5">Current</p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-md text-center">
                    <p className="text-2xl font-bold text-slate-700">{bestStreak}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Best ever</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  Last active: {streak?.last_activity_date || 'Not yet'}
                </p>
              </div>

              {/* Progress card */}
              <div className="bg-white border border-slate-200 rounded-md p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 className="w-5 h-5 text-slate-500" />
                  <h3 className="font-semibold text-slate-900">Progress</h3>
                </div>
                {lessons.length > 0 ? (
                  <>
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span>{completed.length} of {lessons.length} lessons</span>
                      <span>{Math.round((completed.length / lessons.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                      <div
                        className="bg-slate-800 h-2 rounded-full transition-all"
                        style={{ width: `${(completed.length / lessons.length) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400">
                      {lessons.length - completed.length} lesson{lessons.length - completed.length !== 1 ? 's' : ''} remaining
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-slate-400">No lessons loaded yet.</p>
                )}
              </div>

              {/* Quick links */}
              <div className="bg-white border border-slate-200 rounded-md p-5">
                <h3 className="font-semibold text-slate-900 mb-3">Quick links</h3>
                <div className="space-y-1">
                  {[
                    { href: '/learn', icon: BookOpen, label: 'Lesson library' },
                    { href: '/community', icon: Star, label: 'Community' },
                    { href: '/pricing', icon: Star, label: 'Upgrade plan' },
                  ].map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded transition-colors"
                    >
                      <link.icon className="w-4 h-4 text-slate-400" />
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}
