'use client'

import { useEffect, useState } from 'react'
import { Shield } from 'lucide-react'
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

      <div className="grid grid-cols-5 gap-2">
        {allBadges.map(badge => {
          const isEarned = earnedIds.has(badge.id)
          return (
            <div
              key={badge.id}
              className="group relative flex flex-col items-center"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${
                  isEarned
                    ? 'shadow-sm ring-1 ring-black/5'
                    : 'grayscale opacity-30'
                }`}
                style={isEarned ? { backgroundColor: badge.color + '22' } : {}}
              >
                {badge.icon}
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-36 pointer-events-none">
                <div className="bg-slate-900 text-white text-xs rounded-md p-2 text-center shadow-lg">
                  <p className="font-semibold mb-0.5">{badge.name}</p>
                  <p className="text-slate-300 leading-snug">{badge.description}</p>
                  {!isEarned && <p className="text-slate-500 mt-1 text-[10px]">Locked</p>}
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
