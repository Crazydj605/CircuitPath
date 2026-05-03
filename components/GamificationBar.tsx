'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Zap, Trophy, Flame, Star, TrendingUp } from 'lucide-react'
import { cn, calculateLevel, calculateXpForLevel } from '@/lib/utils'
import type { UserStats } from '@/types'

interface GamificationBarProps {
  stats: UserStats
  compact?: boolean
}

export default function GamificationBar({ stats, compact = false }: GamificationBarProps) {
  const level = calculateLevel(stats.total_xp)
  const xpForCurrentLevel = calculateXpForLevel(level)
  const xpForNextLevel = calculateXpForLevel(level + 1)
  const xpProgress = stats.total_xp - xpForCurrentLevel
  const xpNeeded = xpForNextLevel - xpForCurrentLevel
  const progressPercent = (xpProgress / xpNeeded) * 100

  if (compact) {
    return (
      <div className="flex items-center gap-4">
        {/* Level Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-circuit-accent/20 to-circuit-purple/20 rounded-full border border-circuit-accent/30">
          <Star className="w-4 h-4 text-circuit-accent" />
          <span className="font-bold text-white">Level {level}</span>
        </div>

        {/* XP */}
        <div className="flex items-center gap-2 text-sm">
          <Zap className="w-4 h-4 text-circuit-warning" />
          <span className="text-gray-300">{stats.total_xp.toLocaleString()} XP</span>
        </div>

        {/* Streak */}
        {stats.streak_days > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <Flame className={cn('w-4 h-4', stats.streak_days > 5 ? 'text-orange-500' : 'text-circuit-warning')} />
            <span className="text-gray-300">{stats.streak_days} day streak</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-circuit-panel rounded-2xl p-6 border border-white/10">
      {/* Top Stats */}
      <div className="flex items-center justify-between mb-6">
        {/* Level Display */}
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative w-16 h-16"
          >
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="4"
              />
              <motion.circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${progressPercent * 1.76} 176`}
                initial={{ strokeDasharray: '0 176' }}
                animate={{ strokeDasharray: `${progressPercent * 1.76} 176` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00d4ff" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-white">{level}</span>
            </div>
          </motion.div>

          <div>
            <h3 className="text-lg font-bold text-white">Level {level}</h3>
            <p className="text-sm text-gray-400">
              {xpProgress.toLocaleString()} / {xpNeeded.toLocaleString()} XP
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-4 h-4 text-circuit-warning" />
              <span className="text-lg font-bold text-white">{stats.total_xp.toLocaleString()}</span>
            </div>
            <span className="text-xs text-gray-500">Total XP</span>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className={cn(
                'w-4 h-4',
                stats.streak_days >= 7 ? 'text-orange-500' : 'text-circuit-warning'
              )} />
              <span className="text-lg font-bold text-white">{stats.streak_days}</span>
            </div>
            <span className="text-xs text-gray-500">Day Streak</span>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="w-4 h-4 text-circuit-success" />
              <span className="text-lg font-bold text-white">{stats.lessons_completed}</span>
            </div>
            <span className="text-xs text-gray-500">Lessons</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-400">Progress to Level {level + 1}</span>
          <span className="text-circuit-accent font-medium">{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-circuit-accent to-circuit-purple rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Recent Badges */}
      {stats.badges.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-3">Recent Badges</h4>
          <div className="flex gap-3">
            {stats.badges.slice(0, 5).map((badge, idx) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${badge.color}20`, border: `1px solid ${badge.color}40` }}
                >
                  {badge.icon}
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {badge.name}
                </div>
              </motion.div>
            ))}
            {stats.badges.length > 5 && (
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-sm text-gray-400">
                +{stats.badges.length - 5}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
