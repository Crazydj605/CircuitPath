'use client'

import { useEffect, useState } from 'react'
import { Trophy, ArrowUp, ArrowDown, Minus, Crown } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Entry = {
  user_id: string
  display_name: string
  email: string | null
  tier: string
  xp_this_week: number
  rank: number
}

export default function WeeklyLeaderboard() {
  const [top, setTop] = useState<Entry[]>([])
  const [me, setMe] = useState<Entry | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      // Window: last 7 days from now (rolling). UTC.
      const since = new Date()
      since.setUTCDate(since.getUTCDate() - 7)
      const sinceISO = since.toISOString()

      const { data: xpRows } = await supabase
        .from('learning_xp_log')
        .select('user_id, xp_amount')
        .gte('created_at', sinceISO)
      if (!xpRows) {
        setLoading(false)
        return
      }

      const totals = new Map<string, number>()
      for (const r of xpRows) {
        totals.set(r.user_id, (totals.get(r.user_id) ?? 0) + (r.xp_amount ?? 0))
      }
      const userIds = Array.from(totals.keys())
      if (userIds.length === 0) {
        setLoading(false)
        return
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email, subscription_tier')
        .in('id', userIds)

      const profileMap = new Map(
        (profiles ?? []).map((p) => [p.id, p])
      )

      const ranked: Entry[] = Array.from(totals.entries())
        .map(([uid, xp]) => {
          const p = profileMap.get(uid)
          const display =
            p?.name?.trim() ||
            p?.email?.split('@')[0] ||
            'Anonymous'
          return {
            user_id: uid,
            display_name: display,
            email: p?.email ?? null,
            tier: p?.subscription_tier ?? 'free',
            xp_this_week: xp,
            rank: 0,
          }
        })
        .sort((a, b) => b.xp_this_week - a.xp_this_week)
        .map((e, i) => ({ ...e, rank: i + 1 }))

      setTop(ranked.slice(0, 10))

      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const mine = ranked.find((r) => r.user_id === session.user.id)
        if (mine) setMe(mine)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-md p-5">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-slate-900">This week's leaderboard</h3>
        </div>
        <div className="h-4 bg-slate-100 rounded w-1/2 mb-2 animate-pulse" />
        <div className="h-4 bg-slate-100 rounded w-2/3 animate-pulse" />
      </div>
    )
  }

  if (top.length === 0) {
    return null
  }

  const myRankHint = me && me.rank > 5
    ? `You're #${me.rank} this week — ${
        top[4] && top[4].xp_this_week > me.xp_this_week
          ? `${top[4].xp_this_week - me.xp_this_week} XP from top 5`
          : 'climbing the board'
      }.`
    : null

  return (
    <div className="bg-white border border-slate-200 rounded-md p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-slate-900">This week's leaderboard</h3>
        </div>
        <span className="text-[11px] text-slate-400">Last 7 days · resets rolling</span>
      </div>

      <ol className="space-y-1.5">
        {top.map((e) => {
          const isYou = me?.user_id === e.user_id
          const isMax = e.tier === 'max'
          const medal = e.rank === 1 ? '🥇' : e.rank === 2 ? '🥈' : e.rank === 3 ? '🥉' : null
          return (
            <li
              key={e.user_id}
              className={`flex items-center gap-3 px-2.5 py-1.5 rounded ${
                isYou ? 'bg-violet-50 ring-1 ring-violet-200' : ''
              }`}
            >
              <span className="w-6 text-center text-xs font-bold text-slate-500">
                {medal ?? `#${e.rank}`}
              </span>
              <span className="flex-1 text-sm text-slate-800 truncate flex items-center gap-1.5">
                {e.display_name}
                {isMax && <Crown className="w-3 h-3 text-violet-500 shrink-0" />}
                {isYou && <span className="text-[10px] text-violet-700 font-semibold">(you)</span>}
              </span>
              <span className="text-xs font-semibold text-slate-700 tabular-nums">
                {e.xp_this_week.toLocaleString()} XP
              </span>
            </li>
          )
        })}
      </ol>

      {myRankHint && (
        <p className="mt-3 text-xs text-violet-700 font-medium border-t border-slate-100 pt-3">
          {myRankHint}
        </p>
      )}
    </div>
  )
}
