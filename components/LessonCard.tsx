'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Star, Lock, CheckCircle, Play, Zap } from 'lucide-react'
import { cn, calculateLevel } from '@/lib/utils'
import type { Lesson, UserProgress } from '@/types'

interface LessonCardProps {
  lesson: Lesson
  progress?: UserProgress
  userLevel?: number
  onClick?: () => void
}

export default function LessonCard({ lesson, progress, userLevel = 1, onClick }: LessonCardProps) {
  const isCompleted = progress?.status === 'completed'
  const isInProgress = progress?.status === 'in_progress'
  const isLocked = lesson.required_tier === 'premium' && userLevel < 10
  
  const difficultyColors = {
    beginner: 'text-circuit-success border-circuit-success/30',
    intermediate: 'text-circuit-warning border-circuit-warning/30',
    advanced: 'text-circuit-danger border-circuit-danger/30',
  }

  return (
    <motion.div
      whileHover={!isLocked ? { scale: 1.02, y: -4 } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
      onClick={!isLocked ? onClick : undefined}
      className={cn(
        'relative p-6 rounded-2xl border transition-all cursor-pointer',
        isCompleted && 'bg-circuit-success/10 border-circuit-success/30',
        isInProgress && 'bg-circuit-accent/10 border-circuit-accent',
        !isCompleted && !isInProgress && !isLocked && 'bg-circuit-panel border-white/10 hover:border-circuit-accent/50',
        isLocked && 'bg-circuit-panel/50 border-white/5 opacity-60 cursor-not-allowed'
      )}
    >
      {/* Status Badge */}
      {isCompleted && (
        <div className="absolute top-4 right-4 w-8 h-8 bg-circuit-success rounded-full flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-black" />
        </div>
      )}
      
      {isInProgress && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-circuit-accent/20 border border-circuit-accent/30 rounded-full text-xs font-medium text-circuit-accent">
          In Progress
        </div>
      )}

      {isLocked && (
        <div className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
          <Lock className="w-4 h-4 text-gray-400" />
        </div>
      )}

      {/* Icon */}
      <div className={cn(
        'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
        isCompleted ? 'bg-circuit-success/20' : 'bg-circuit-accent/20'
      )}>
        {isCompleted ? (
          <Zap className="w-6 h-6 text-circuit-success" />
        ) : isInProgress ? (
          <Play className="w-6 h-6 text-circuit-accent fill-current" />
        ) : (
          <Zap className="w-6 h-6 text-circuit-accent" />
        )}
      </div>

      {/* Content */}
      <h3 className="text-lg font-bold text-white mb-2">{lesson.title}</h3>
      <p className="text-sm text-gray-400 mb-4 line-clamp-2">{lesson.description}</p>

      {/* Meta */}
      <div className="flex items-center gap-4 text-sm">
        <span className={cn(
          'px-2 py-1 border rounded-lg text-xs font-medium',
          difficultyColors[lesson.difficulty]
        )}>
          {lesson.difficulty}
        </span>
        
        <div className="flex items-center gap-1 text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{lesson.duration_minutes}m</span>
        </div>
        
        <div className="flex items-center gap-1 text-circuit-warning">
          <Star className="w-4 h-4" />
          <span>+{lesson.xp_reward} XP</span>
        </div>
      </div>

      {/* Progress Bar */}
      {isInProgress && progress && (
        <div className="mt-4">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-circuit-accent rounded-full transition-all"
              style={{ width: `${(progress.time_spent_minutes / lesson.duration_minutes) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Tier Badge */}
      {lesson.required_tier !== 'free' && (
        <div className="absolute bottom-4 right-4">
          <span className={cn(
            'px-2 py-1 rounded-lg text-xs font-bold uppercase',
            lesson.required_tier === 'pro' 
              ? 'bg-circuit-purple/20 text-circuit-purple border border-circuit-purple/30'
              : 'bg-gradient-to-r from-circuit-accent/20 to-circuit-purple/20 text-circuit-accent border border-circuit-accent/30'
          )}>
            {lesson.required_tier}
          </span>
        </div>
      )}
    </motion.div>
  )
}
