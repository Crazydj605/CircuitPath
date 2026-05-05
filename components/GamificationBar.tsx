'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Zap, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserStats } from '@/types'

interface GamificationBarProps {
  stats: UserStats
  compact?: boolean
}

export default function GamificationBar({ stats, compact = false }: GamificationBarProps) {
  const xpForNextLevel = stats.level * 100
  const xpProgress = (stats.total_xp % xpForNextLevel) / xpForNextLevel * 100

  if (compact) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-circuit-warning" />
          <span className="text-sm font-semibold text-white">Lv. {stats.level}</span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-circuit-accent" />
          <span className="text-sm text-gray-300">{stats.total_xp} XP</span>
        </div>
        {stats.streak_days > 0 && (
          <>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-circuit-danger" />
              <span className="text-sm text-circuit-danger">{stats.streak_days}</span>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="p-4 bg-circuit-panel border border-white/10 rounded-2xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-circuit-accent to-circuit-purple flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-circuit-panel rounded-full flex items-center justify-center text-xs font-bold text-white border border-white/10">
              {stats.level}
            </div>
          </div>
          <div>
            <p className="font-semibold text-white">Level {stats.level}</p>
            <p className="text-sm text-gray-400">{stats.total_xp} / {xpForNextLevel} XP</p>
          </div>
        </div>
        {stats.streak_days > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-circuit-danger/20 rounded-full">
            <Flame className="w-4 h-4 text-circuit-danger" />
            <span className="text-sm font-medium text-circuit-danger">{stats.streak_days} day streak</span>
          </div>
        )}
      </div>

      {/* XP Progress Bar */}
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${xpProgress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-circuit-accent to-circuit-purple rounded-full"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="text-center p-3 bg-white/5 rounded-xl">
          <p className="text-lg font-bold text-white">{stats.lessons_completed}</p>
          <p className="text-xs text-gray-400">Lessons</p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-xl">
          <p className="text-lg font-bold text-circuit-accent">{Math.floor(stats.total_time_minutes / 60)}h</p>
          <p className="text-xs text-gray-400">Study Time</p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-xl">
          <p className="text-lg font-bold text-circuit-success">{stats.total_xp}</p>
          <p className="text-xs text-gray-400">Total XP</p>
        </div>
      </div>
    </div>
  )
}
