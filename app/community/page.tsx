'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Users, MessageSquare, Trophy, TrendingUp, Heart, Share2, MessageCircle, Target, Flame, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

const AVATAR_COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
]

const LEADERBOARD = [
  { rank: 1, name: 'Alex Chen', xp: 12500, streak: 45, avatar: 'A' },
  { rank: 2, name: 'Sarah Miller', xp: 11200, streak: 32, avatar: 'S' },
  { rank: 3, name: 'James Wilson', xp: 10800, streak: 28, avatar: 'J' },
  { rank: 4, name: 'You', xp: 1240, streak: 5, avatar: 'Y', isUser: true },
  { rank: 5, name: 'Maria Garcia', xp: 9800, streak: 21, avatar: 'M' },
]

const RANK_MEDALS = ['🥇', '🥈', '🥉']

const RECENT_POSTS = [
  {
    id: 1,
    author: 'David Park',
    avatar: 'D',
    colorIdx: 0,
    title: 'Just completed my first working LED circuit!',
    content: 'Finally got the resistor values right. The multimeter was the key tool I was missing — if you\'re struggling, grab one.',
    likes: 24,
    comments: 8,
    time: '2 hours ago',
    tag: 'Win',
    tagColor: 'bg-green-100 text-green-700',
  },
  {
    id: 2,
    author: 'Emma Thompson',
    avatar: 'E',
    colorIdx: 4,
    title: 'Help with servo motor jitter?',
    content: 'My servo works but has slight jitter when holding position. Using Arduino Uno with the standard servo library. Any ideas?',
    likes: 12,
    comments: 15,
    time: '5 hours ago',
    tag: 'Question',
    tagColor: 'bg-blue-100 text-blue-700',
  },
  {
    id: 3,
    author: 'Michael Liu',
    avatar: 'M',
    colorIdx: 2,
    title: 'Week 4 project: Digital Dice — sharing my schematic',
    content: "Here's the circuit diagram I used for the Digital Dice project. The 555 timer configuration took some tweaking but it's clean now.",
    likes: 56,
    comments: 23,
    time: '1 day ago',
    tag: 'Project',
    tagColor: 'bg-violet-100 text-violet-700',
  },
]

const CHALLENGES = [
  { name: '7-Day Streak Challenge', participants: 1247, daysLeft: 3, joined: true, color: 'bg-amber-50 border-amber-200' },
  { name: 'Build a Night Light', participants: 892, daysLeft: 12, joined: false, color: 'bg-slate-50 border-slate-200' },
  { name: 'Component ID Quiz', participants: 2156, daysLeft: 5, joined: false, color: 'bg-slate-50 border-slate-200' },
]

export default function Community() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [postText, setPostText] = useState('')
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/'); return }
      setUser(session.user)
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

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { icon: Users, label: 'Learners', value: '50K+', color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200' },
              { icon: MessageSquare, label: 'Posts today', value: '2.3K', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
              { icon: Trophy, label: 'Challenges', value: '156', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
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

              {/* Post composer */}
              <div className="bg-white border border-slate-200 rounded-md p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${AVATAR_COLORS[0]}`}>
                    {userInitial}
                  </div>
                  <input
                    type="text"
                    value={postText}
                    onChange={e => setPostText(e.target.value)}
                    placeholder="Share your progress or ask a question..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-md px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    disabled={!postText.trim()}
                    className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Post
                  </button>
                </div>
              </div>

              {/* Posts */}
              {RECENT_POSTS.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="bg-white border border-slate-200 rounded-md overflow-hidden hover:border-slate-300 transition-colors"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${AVATAR_COLORS[post.colorIdx]}`}>
                          {post.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{post.author}</p>
                          <p className="text-xs text-slate-400">{post.time}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${post.tagColor}`}>
                        {post.tag}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-slate-900 mb-1.5">{post.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">{post.content}</p>

                    <div className="flex items-center gap-5 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => setLikedPosts(prev => {
                          const next = new Set(prev)
                          next.has(post.id) ? next.delete(post.id) : next.add(post.id)
                          return next
                        })}
                        className={`flex items-center gap-1.5 text-sm transition-colors ${
                          likedPosts.has(post.id) ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-rose-500' : ''}`} />
                        {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                      </button>
                      <button className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments}
                      </button>
                      <button className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors ml-auto">
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">

              {/* Leaderboard */}
              <div className="bg-white border border-slate-200 rounded-md p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <h3 className="font-semibold text-slate-900">Leaderboard</h3>
                </div>
                <div className="space-y-2">
                  {LEADERBOARD.map((entry, i) => (
                    <div
                      key={entry.rank}
                      className={`flex items-center gap-3 p-2.5 rounded-md ${
                        entry.isUser ? 'bg-slate-100 border border-slate-200' : 'hover:bg-slate-50'
                      }`}
                    >
                      <span className="w-6 text-center text-sm">
                        {i < 3 ? RANK_MEDALS[i] : <span className="text-slate-400 font-medium">{entry.rank}</span>}
                      </span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                        {entry.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate font-medium ${entry.isUser ? 'text-slate-900' : 'text-slate-700'}`}>
                          {entry.name}
                        </p>
                        <p className="text-xs text-slate-400">{entry.xp.toLocaleString()} XP</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-amber-500">
                        <Flame className="w-3 h-3" />
                        {entry.streak}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Challenges */}
              <div className="bg-white border border-slate-200 rounded-md p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-slate-600" />
                  <h3 className="font-semibold text-slate-900">Active Challenges</h3>
                </div>
                <div className="space-y-3">
                  {CHALLENGES.map(c => (
                    <div key={c.name} className={`p-3 border rounded-md ${c.color}`}>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="text-sm font-medium text-slate-900 leading-snug">{c.name}</p>
                        {c.joined && (
                          <span className="text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded shrink-0">Joined</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{c.participants.toLocaleString()} builders</span>
                        <span>{c.daysLeft}d left</span>
                      </div>
                      {!c.joined && (
                        <button className="mt-2.5 w-full flex items-center justify-center gap-1 py-1.5 bg-slate-900 text-white text-xs font-medium rounded hover:bg-slate-800 transition-colors">
                          Join <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Your activity */}
              <div className="bg-white border border-slate-200 rounded-md p-5">
                <h3 className="font-semibold text-slate-900 mb-4">Your Activity</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Posts', value: '3' },
                    { label: 'Comments', value: '12' },
                    { label: 'Likes received', value: '47' },
                    { label: 'Challenges joined', value: '1' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                      <span className="text-sm text-slate-500">{item.label}</span>
                      <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                    </div>
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
