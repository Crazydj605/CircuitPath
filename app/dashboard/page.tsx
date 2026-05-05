'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Zap, BookOpen, Trophy, Target, TrendingUp, Clock,
  ChevronRight, Play, Award, Users, Settings
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import ArcMascot from '@/components/ArcMascot'

const RECENT_LESSONS = [
  { id: 1, title: 'Ohm\'s Law Fundamentals', progress: 75, duration: '15 min', category: 'Foundation' },
  { id: 2, title: 'LED Circuit Basics', progress: 30, duration: '20 min', category: 'Foundation' },
  { id: 3, title: 'Resistor Color Codes', progress: 0, duration: '12 min', category: 'Foundation' },
]

const ACHIEVEMENTS = [
  { name: 'First Circuit', icon: Zap, earned: true },
  { name: '7-Day Streak', icon: Trophy, earned: true },
  { name: 'Project Master', icon: Award, earned: false },
  { name: 'Community Helper', icon: Users, earned: false },
]

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/')
        return
      }
      setUser(session.user)
      setLoading(false)
    })
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

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
              Continue where you left off. You're making great progress!
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-white border border-slate-200 rounded">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
                  <Target className="w-4 h-4 text-slate-600" />
                </div>
                <span className="text-sm text-slate-500">Current Level</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">Foundation</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-slate-600" />
                </div>
                <span className="text-sm text-slate-500">Streak</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">5 days</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-slate-600" />
                </div>
                <span className="text-sm text-slate-500">XP Earned</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">1,240</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
                  <Clock className="w-4 h-4 text-slate-600" />
                </div>
                <span className="text-sm text-slate-500">Time Learning</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">4.2 hrs</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Continue Learning */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900">Continue Learning</h2>
                <a href="/learn" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </a>
              </div>

              <div className="space-y-3">
                {RECENT_LESSONS.map((lesson, idx) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        lesson.progress > 0 ? 'bg-slate-100' : 'bg-slate-100'
                      }`}>
                        {lesson.progress > 0 ? (
                          <Play className="w-5 h-5 text-slate-600" />
                        ) : (
                          <BookOpen className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-slate-500">{lesson.category}</span>
                        </div>
                        <h3 className="text-slate-900 font-medium mb-1">{lesson.title}</h3>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden max-w-[120px]">
                            <div 
                              className="h-full bg-slate-600 rounded-full transition-all"
                              style={{ width: `${lesson.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-slate-500">{lesson.progress}%</span>
                          <span className="text-sm text-slate-500">{lesson.duration}</span>
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-700 transition-colors" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Next Milestone */}
              <div className="p-4 bg-white border border-slate-200 rounded">
                <h3 className="text-slate-900 font-semibold mb-2">Next Milestone</h3>
                <p className="text-sm text-slate-500 mb-4">Complete 3 more lessons to unlock Circuit Design level</p>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-600 rounded-full" style={{ width: '66%' }} />
                </div>
                <p className="text-sm text-slate-500 mt-2">2 of 3 lessons completed</p>
              </div>

              {/* Achievements */}
              <div>
                <h3 className="text-slate-900 font-semibold mb-4">Recent Achievements</h3>
                <div className="grid grid-cols-2 gap-3">
                  {ACHIEVEMENTS.map((achievement) => (
                    <div 
                      key={achievement.name}
                      className={`p-3 rounded border text-center ${
                        achievement.earned 
                          ? 'bg-slate-100 border-slate-200' 
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <achievement.icon className={`w-6 h-6 mx-auto mb-2 ${
                        achievement.earned ? 'text-slate-700' : 'text-slate-400'
                      }`} />
                      <p className={`text-xs ${achievement.earned ? 'text-slate-900' : 'text-slate-500'}`}>
                        {achievement.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-slate-900 font-semibold mb-4">Quick Links</h3>
                <div className="space-y-2">
                  <a href="/learn" className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                    <BookOpen className="w-5 h-5 text-slate-600" />
                    <span className="text-slate-900 text-sm">Browse Lessons</span>
                  </a>
                  <a href="/community" className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                    <Users className="w-5 h-5 text-slate-600" />
                    <span className="text-slate-900 text-sm">Community</span>
                  </a>
                  <a href="/settings" className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                    <Settings className="w-5 h-5 text-slate-500" />
                    <span className="text-slate-900 text-sm">Settings</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Arc Welcome Tutorial - Shows once for new users */}
      <ArcMascot 
        showOnce={true}
        storageKey="arc-dashboard-welcome"
      />
    </main>
  )
}
