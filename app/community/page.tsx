'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Users, MessageSquare, Trophy, TrendingUp, Heart,
  Share2, MessageCircle, Zap, Target, Award
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

const LEADERBOARD = [
  { rank: 1, name: 'Alex Chen', xp: 12500, streak: 45, avatar: 'A' },
  { rank: 2, name: 'Sarah Miller', xp: 11200, streak: 32, avatar: 'S' },
  { rank: 3, name: 'James Wilson', xp: 10800, streak: 28, avatar: 'J' },
  { rank: 4, name: 'You', xp: 1240, streak: 5, avatar: 'Y', isUser: true },
  { rank: 5, name: 'Maria Garcia', xp: 9800, streak: 21, avatar: 'M' },
]

const RECENT_POSTS = [
  {
    id: 1,
    author: 'David Park',
    avatar: 'D',
    title: 'Just completed my first working LED circuit!',
    content: 'Finally got the resistor values right. The multimeter was the key tool I was missing.',
    likes: 24,
    comments: 8,
    time: '2 hours ago',
  },
  {
    id: 2,
    author: 'Emma Thompson',
    avatar: 'E',
    title: 'Help with servo motor jitter?',
    content: 'My servo works but has slight jitter when holding position. Using Arduino Uno. Any ideas?',
    likes: 12,
    comments: 15,
    time: '5 hours ago',
  },
  {
    id: 3,
    author: 'Michael Liu',
    avatar: 'M',
    title: 'Week 4 project: Digital Dice - sharing my schematic',
    content: 'Here\'s the circuit diagram I used. The 555 timer configuration took some tweaking.',
    likes: 56,
    comments: 23,
    time: '1 day ago',
  },
]

const CHALLENGES = [
  { name: '7-Day Streak Challenge', participants: 1247, daysLeft: 3, joined: true },
  { name: 'Build a Night Light', participants: 892, daysLeft: 12, joined: false },
  { name: 'Component ID Quiz', participants: 2156, daysLeft: 5, joined: false },
]

export default function Community() {
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
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Community</h1>
            <p className="text-slate-500">
              Connect with fellow learners, share projects, and join challenges
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-white border border-slate-200 rounded text-center">
                  <Users className="w-5 h-5 text-slate-600 mx-auto mb-2" />
                  <p className="text-xl font-bold text-slate-900">50K+</p>
                  <p className="text-xs text-slate-500">Learners</p>
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded text-center">
                  <MessageSquare className="w-5 h-5 text-slate-600 mx-auto mb-2" />
                  <p className="text-xl font-bold text-slate-900">2.3K</p>
                  <p className="text-xs text-slate-500">Posts Today</p>
                </div>
                <div className="p-4 bg-white border border-slate-200 rounded text-center">
                  <Trophy className="w-5 h-5 text-slate-600 mx-auto mb-2" />
                  <p className="text-xl font-bold text-slate-900">156</p>
                  <p className="text-xs text-slate-500">Active Challenges</p>
                </div>
              </div>

              {/* Create Post */}
              <div className="p-4 bg-white border border-slate-200 rounded">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-800 font-semibold">
                    {user?.email?.[0].toUpperCase() || 'Y'}
                  </div>
                  <input
                    type="text"
                    placeholder="Share your progress or ask a question..."
                    className="flex-1 bg-white border border-slate-300 rounded px-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              {/* Posts Feed */}
              <div className="space-y-4">
                {RECENT_POSTS.map((post, idx) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 bg-white border border-slate-200 rounded"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 font-semibold">
                        {post.avatar}
                      </div>
                      <div>
                        <h4 className="text-slate-900 font-medium">{post.author}</h4>
                        <p className="text-xs text-slate-500">{post.time}</p>
                      </div>
                    </div>
                    
                    <h3 className="text-slate-900 font-medium mb-2">{post.title}</h3>
                    <p className="text-slate-600 text-sm mb-4">{post.content}</p>
                    
                    <div className="flex items-center gap-6">
                      <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
                        <Heart className="w-4 h-4" />
                        {post.likes}
                      </button>
                      <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments}
                      </button>
                      <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Leaderboard */}
              <div className="p-4 bg-white border border-slate-200 rounded">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-slate-600" />
                  <h3 className="text-slate-900 font-semibold">Leaderboard</h3>
                </div>
                <div className="space-y-3">
                  {LEADERBOARD.map((user) => (
                    <div 
                      key={user.rank} 
                      className={`flex items-center gap-3 p-2 rounded ${
                        user.isUser ? 'bg-slate-100 border border-slate-300' : ''
                      }`}
                    >
                      <span className={`w-6 text-center text-sm font-medium ${
                        user.rank <= 3 ? 'text-slate-700' : 'text-slate-500'
                      }`}>
                        {user.rank}
                      </span>
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 text-sm font-semibold">
                        {user.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${user.isUser ? 'text-slate-900' : 'text-slate-900'}`}>
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500">{user.xp.toLocaleString()} XP</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <TrendingUp className="w-3 h-3" />
                        {user.streak}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Challenges */}
              <div className="p-4 bg-white border border-slate-200 rounded">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-slate-600" />
                  <h3 className="text-slate-900 font-semibold">Challenges</h3>
                </div>
                <div className="space-y-3">
                  {CHALLENGES.map((challenge) => (
                    <div key={challenge.name} className="p-3 bg-slate-50 border border-slate-200 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-slate-900 font-medium">{challenge.name}</p>
                        {challenge.joined && (
                          <span className="text-xs text-slate-700">Joined</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{challenge.participants.toLocaleString()} participants</span>
                        <span>{challenge.daysLeft} days left</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Your Stats */}
              <div className="p-4 bg-white border border-slate-200 rounded">
                <h3 className="text-slate-900 font-semibold mb-4">Your Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Posts</span>
                    <span className="text-sm text-slate-900">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Comments</span>
                    <span className="text-sm text-slate-900">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Likes Received</span>
                    <span className="text-sm text-slate-900">47</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Challenges</span>
                    <span className="text-sm text-slate-900">1 joined</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
