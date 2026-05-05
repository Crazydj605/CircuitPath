'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Award, Lock, CheckCircle, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Lesson } from '@/types'

interface LessonCardProps {
  lesson: Lesson
  userLevel: number
  progress?: 'locked' | 'available' | 'in_progress' | 'completed'
  onClick?: () => void
}

export default function LessonCard({ lesson, userLevel, progress = 'available', onClick }: LessonCardProps) {
  const isLocked = progress === 'locked'
  const isCompleted = progress === 'completed'
  const isInProgress = progress === 'in_progress'

  const difficultyColors = {
    beginner: 'text-circuit-success border-circuit-success/30 bg-circuit-success/10',
    intermediate: 'text-circuit-warning border-circuit-warning/30 bg-circuit-warning/10',
    advanced: 'text-circuit-danger border-circuit-danger/30 bg-circuit-danger/10',
  }

  return (
    <motion.div
      whileHover={!isLocked ? { scale: 1.02, y: -4 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
      onClick={!isLocked ? onClick : undefined}
      className={cn(
        'relative p-6 rounded-2xl border transition-all cursor-pointer',
        isLocked
          ? 'bg-circuit-panel/50 border-white/5 opacity-60 cursor-not-allowed'
          : isCompleted
          ? 'bg-circuit-panel border-circuit-success/30'
          : isInProgress
          ? 'bg-circuit-panel border-circuit-accent'
          : 'bg-circuit-panel border-white/10 hover:border-circuit-accent/50'
      )}
    >
      {/* Status Badge */}
      <div className="absolute -top-3 -right-3">
        {isLocked && (
          <div className="w-8 h-8 bg-circuit-panel rounded-full flex items-center justify-center border border-white/10">
            <Lock className="w-4 h-4 text-gray-500" />
          </div>
        )}
        {isCompleted && (
          <div className="w-8 h-8 bg-circuit-success/20 rounded-full flex items-center justify-center border border-circuit-success/30">
            <CheckCircle className="w-4 h-4 text-circuit-success" />
          </div>
        )}
        {isInProgress && (
          <div className="w-8 h-8 bg-circuit-accent/20 rounded-full flex items-center justify-center border border-circuit-accent/30">
            <Play className="w-4 h-4 text-circuit-accent" />
          </div>
        )}
      </div>

      {/* Difficulty Badge */}
      <span
        className={cn(
          'inline-block px-3 py-1 rounded-full text-xs font-medium border',
          difficultyColors[lesson.difficulty]
        )}
      >
        {lesson.difficulty}
      </span>

      {/* Content */}
      <h3 className="mt-3 text-lg font-semibold text-white">{lesson.title}</h3>
      <p className="mt-1 text-sm text-gray-400 line-clamp-2">{lesson.description}</p>

      {/* Meta Info */}
      <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{lesson.duration_minutes} min</span>
        </div>
        <div className="flex items-center gap-1">
          <Award className="w-4 h-4 text-circuit-accent" />
          <span className="text-circuit-accent">+{lesson.xp_reward} XP</span>
        </div>
      </div>

      {/* Progress Bar for In Progress */}
      {isInProgress && (
        <div className="mt-4">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-circuit-accent rounded-full" />
          </div>
          <p className="mt-1 text-xs text-circuit-accent">50% complete</p>
        </div>
      )}

      {/* Tier Badge */}
      {lesson.required_tier !== 'free' && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <span
            className={cn(
              'text-xs font-medium',
              lesson.required_tier === 'pro' ? 'text-circuit-warning' : 'text-circuit-purple'
            )}
          >
            {lesson.required_tier === 'pro' ? 'Pro' : 'Premium'} Plan
          </span>
        </div>
      )}
    </motion.div>
  )
}
