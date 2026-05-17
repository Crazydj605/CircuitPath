'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Users, MessageSquare, Trophy, TrendingUp, Sparkles, Target, Flame, ArrowRight, Shield, Rocket } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import WeeklyChallenge from '@/components/WeeklyChallenge'
import ShowcaseGallery from '@/components/ShowcaseGallery'

const AVATAR_COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
]

export default function Community() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userXp, setUserXp] = useState(0)
  const [userStreak, setUserStreak] = useState(0)
  const [userBadgeCount, setUserBadgeCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'feed' | 'showcase'>('feed')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/'); return }
      setUser(session.user)
      const [profileResult, streakResult, badgeResult] = await Promise.all([
        supabase.from('profiles').select('xp').eq('id', session.user.id).maybeSingle(),
        supabase.from('learning_user_streaks').select('current_streak_days').eq('user_id', session.user.id).maybeSingle(),
        supabase.from('user_badges').select('id', { count: 'exact' }).eq('user_id', session.user.id),
      ])
      setUserXp(profileResult.data?.xp || 0)
      setUserStreak(streakResult.data?.current_streak_days || 0)
      setUserBadgeCount(badgeResult.count || 0)
      setLoading(false)
    })
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
      </div>
    )
  }

  const userInitial = user?.email?.[0]?.toUpperCase() || 'Y'

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-20 pb-16">

        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Community</h1>
            <p className="text-slate-500 text-sm">Connect with builders, share projects, and join challenges.</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 mt-6">

          {/* Stats bar - showing real user stats only */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { icon: Trophy, label: 'Your XP', value: userXp.toLocaleString(), color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200' },
              { icon: Flame, label: 'Your Streak', value: `${userStreak} days`, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
              { icon: Shield, label: 'Your Badges', value: userBadgeCount.toString(), color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
            ].map(stat => (
              <div key={stat.label} className={`flex items-center gap-3 p-4 bg-white border rounded-md ${stat.bg}`}>
                <div className={`w-9 h-9 rounded flex items-center justify-center ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">

            {/* Main feed */}
            <div className="lg:col-span-2 space-y-4">

              {/* Tabs */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-md w-fit">
                <button
                  onClick={() => setActiveTab('feed')}
                  className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${activeTab === 'feed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Feed
                </button>
                <button
                  onClick={() => setActiveTab('showcase')}
                  className={`px-4 py-1.5 text-sm font-medium rounded transition-colors ${activeTab === 'showcase' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Showcase
                </button>
              </div>

              {activeTab === 'showcase' && <ShowcaseGallery />}

              {activeTab === 'feed' && <>

              {/* Weekly Challenge */}
              <WeeklyChallenge />

              {/* Community Launching Soon */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-md p-8 text-center"
              >
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Join Us on Discord</h3>
                <p className="text-slate-400 mb-4 max-w-md mx-auto">
                  Our Discord is live — share your builds, ask questions, and join the weekly project challenge with fellow makers.
                </p>
                <a
                  href="https://discord.gg/circuitpath"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-md transition-colors"
                >
                  <Users className="w-4 h-4" /> Join the Discord
                </a>
              </motion.div>

              {/* Preview: What to expect */}
              <div className="bg-white border border-slate-200 rounded-md p-5">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  What's Coming
                </h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { icon: MessageSquare, title: 'Project Sharing', desc: 'Post your builds and get feedback' },
                    { icon: Trophy, title: 'Leaderboards', desc: 'Compete with other learners' },
                    { icon: Target, title: 'Challenges', desc: 'Weekly building challenges' },
                  ].map((item, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-md">
                      <item.icon className="w-5 h-5 text-slate-600 mb-2" />
                      <p className="text-sm font-medium text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

            </>}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">

              {/* Your Stats */}
              <div className="bg-white border border-slate-200 rounded-md p-5">
                <h3 className="font-semibold text-slate-900 mb-4">Your Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-violet-500" /> XP
                    </span>
                    <span className="text-sm font-semibold text-slate-900">{userXp.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-amber-500" /> Streak
                    </span>
                    <span className="text-sm font-semibold text-slate-900">{userStreak} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-blue-500" /> Badges
                    </span>
                    <span className="text-sm font-semibold text-slate-900">{userBadgeCount}</span>
                  </div>
                </div>
              </div>

              {/* Community Preview */}
              <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-md p-5 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-indigo-300" />
                  <h3 className="font-semibold">Discord Community</h3>
                </div>
                <p className="text-sm text-indigo-200 mb-4">
                  Post your builds, join the weekly project challenge, and connect with other makers.
                </p>
                <a
                  href="https://discord.gg/circuitpath"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-2 rounded-md transition-colors"
                >
                  <Target className="w-3 h-3" /> Join Now →
                </a>
              </div>

              {/* Quick Links */}
              <div className="bg-white border border-slate-200 rounded-md p-5">
                <h3 className="font-semibold text-slate-900 mb-3">Quick Links</h3>
                <div className="space-y-2">
                  <a href="/dashboard" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
                    <ArrowRight className="w-4 h-4" /> Go to Dashboard
                  </a>
                  <a href="/learn" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
                    <ArrowRight className="w-4 h-4" /> Continue Learning
                  </a>
                  <a href="/tutoring" className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
                    <ArrowRight className="w-4 h-4" /> Book Tutoring
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
