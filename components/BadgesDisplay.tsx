'use client'

import { useEffect, useState } from 'react'
import { Shield, Star, Zap, Trophy, Target, Flame, Sparkles, Award, Lightbulb, Rocket } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getUserBadges } from '@/lib/learning'

type BadgeEntry = {
  earned_at: string
  badge: {
    id: string
    slug: string
    name: string
    description: string
    icon: string
    color: string
    category: string
  }
}

// Unique badge cover designs for locked badges
const BADGE_COVERS: Record<string, { icon: any; pattern: string; bg: string }> = {
  'first-steps': { icon: Star, pattern: 'radial', bg: 'from-amber-400 to-orange-500' },
  'streak-7': { icon: Flame, pattern: 'flame', bg: 'from-red-400 to-orange-500' },
  'streak-30': { icon: Zap, pattern: 'lightning', bg: 'from-yellow-400 to-amber-500' },
  'completionist': { icon: Trophy, pattern: 'crown', bg: 'from-violet-400 to-purple-500' },
  'quick-learner': { icon: Rocket, pattern: 'speed', bg: 'from-blue-400 to-cyan-500' },
  'helper': { icon: Lightbulb, pattern: 'bulb', bg: 'from-green-400 to-emerald-500' },
  'expert': { icon: Award, pattern: 'star', bg: 'from-pink-400 to-rose-500' },
  'master': { icon: Target, pattern: 'target', bg: 'from-indigo-400 to-violet-500' },
  'max-exclusive': { icon: Sparkles, pattern: 'sparkle', bg: 'from-amber-300 to-yellow-400' },
}

function LockedBadgeCover({ badge }: { badge: BadgeEntry['badge'] }) {
  const cover = BADGE_COVERS[badge.slug] || { icon: Shield, pattern: 'dots', bg: 'from-slate-300 to-slate-400' }
  const Icon = cover.icon

  return (
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center relative overflow-hidden bg-gradient-to-br ${cover.bg}`}>
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-30">
        {cover.pattern === 'radial' && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[length:4px_4px]" />
        )}
        {cover.pattern === 'flame' && (
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-white/30 to-transparent" />
        )}
        {cover.pattern === 'lightning' && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 40 40">
            <path d="M20 5 L25 15 L20 15 L22 25 L15 20 L18 20 Z" fill="white" opacity="0.4" />
          </svg>
        )}
        {cover.pattern === 'crown' && (
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-6 h-3 bg-white/30 rounded-t-full" />
        )}
        {cover.pattern === 'star' && (
          <div className="absolute top-1 right-1 w-2 h-2 bg-white/50 rounded-full" />
        )}
      </div>
      <Icon className="w-5 h-5 text-white relative z-10" />
      {/* Lock indicator */}
      <div className="absolute bottom-0.5 right-0.5">
        <div className="w-3 h-3 bg-slate-900/70 rounded-full flex items-center justify-center">
          <div className="w-1 h-1.5 bg-white/80 rounded-t" />
        </div>
      </div>
    </div>
  )
}

export default function BadgesDisplay({ userId }: { userId?: string }) {
  const [earned, setEarned] = useState<BadgeEntry[]>([])
  const [allBadges, setAllBadges] = useState<BadgeEntry['badge'][]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const uid = userId ?? (await supabase.auth.getUser()).data.user?.id
      if (!uid) { setLoading(false); return }
      const [earnedData, { data: all }] = await Promise.all([
        getUserBadges(uid),
        supabase.from('badges').select('id, slug, name, description, icon, color, category').order('category'),
      ])
      setEarned(earnedData)
      setAllBadges(all || [])
      setLoading(false)
    }
    load()
  }, [userId])

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-md p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-slate-400" />
          <h3 className="font-semibold text-slate-900">Badges</h3>
        </div>
        <div className="h-12 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  const earnedIds = new Set(earned.map(e => e.badge.id))

  return (
    <div className="bg-white border border-slate-200 rounded-md p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-slate-500" />
          <h3 className="font-semibold text-slate-900">Badges</h3>
        </div>
        <span className="text-xs text-slate-400">{earned.length}/{allBadges.length} earned</span>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {allBadges.map(badge => {
          const isEarned = earnedIds.has(badge.id)
          return (
            <div
              key={badge.id}
              className="group relative flex flex-col items-center"
            >
              {isEarned ? (
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all shadow-sm ring-1 ring-black/5"
                  style={{ backgroundColor: badge.color + '22' }}
                >
                  <span className="text-lg">{badge.icon}</span>
                </div>
              ) : (
                <LockedBadgeCover badge={badge} />
              )}
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-36 pointer-events-none">
                <div className="bg-slate-900 text-white text-xs rounded-md p-2 text-center shadow-lg">
                  <p className="font-semibold mb-0.5">{badge.name}</p>
                  <p className="text-slate-300 leading-snug">{badge.description}</p>
                  {!isEarned && <p className="text-amber-400 mt-1 text-[10px] font-medium">🔒 Complete to unlock</p>}
                </div>
                <div className="w-2 h-2 bg-slate-900 rotate-45 mx-auto -mt-1" />
              </div>
            </div>
          )
        })}
      </div>

      {earned.length === 0 && (
        <p className="text-xs text-slate-400 text-center mt-3">
          Complete lessons and challenges to earn badges!
        </p>
      )}
    </div>
  )
}
