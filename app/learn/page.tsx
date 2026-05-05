'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  BookOpen, Lock, CheckCircle, Play, Clock, Target,
  ChevronRight, Zap, Cpu, Layers
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

const LEVELS = [
  {
    id: 'foundation',
    name: 'Foundation',
    description: 'Circuit basics, Ohm\'s Law, component identification',
    lessons: 12,
    completed: 3,
    locked: false,
    icon: Zap,
  },
  {
    id: 'circuit-design',
    name: 'Circuit Design',
    description: 'Resistor networks, capacitors, switches & logic',
    lessons: 15,
    completed: 0,
    locked: true,
    icon: Layers,
  },
  {
    id: 'programming',
    name: 'Programming',
    description: 'Arduino basics, C++ fundamentals, sensors',
    lessons: 20,
    completed: 0,
    locked: true,
    icon: Cpu,
  },
  {
    id: 'automation',
    name: 'Automation',
    description: 'Motor control, PID loops, wireless communication',
    lessons: 18,
    completed: 0,
    locked: true,
    icon: Target,
  },
]

const FOUNDATION_LESSONS = [
  { id: 1, title: 'Introduction to Electronics', duration: '10 min', completed: true, locked: false },
  { id: 2, title: 'Understanding Voltage & Current', duration: '15 min', completed: true, locked: false },
  { id: 3, title: 'Ohm\'s Law Fundamentals', duration: '15 min', completed: true, locked: false },
  { id: 4, title: 'Component Identification', duration: '20 min', completed: false, locked: false, inProgress: true },
  { id: 5, title: 'Breadboarding Basics', duration: '18 min', completed: false, locked: false },
  { id: 6, title: 'Your First LED Circuit', duration: '25 min', completed: false, locked: true },
  { id: 7, title: 'Resistor Color Codes', duration: '12 min', completed: false, locked: true },
  { id: 8, title: 'Series & Parallel Circuits', duration: '22 min', completed: false, locked: true },
]

export default function Learn() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeLevel, setActiveLevel] = useState('foundation')

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
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const currentLevel = LEVELS.find(l => l.id === activeLevel) || LEVELS[0]

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Learning Library</h1>
            <p className="text-gray-400">
              Master robotics through structured, hands-on lessons
            </p>
          </div>

          {/* Level Selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {LEVELS.map((level) => (
              <button
                key={level.id}
                onClick={() => !level.locked && setActiveLevel(level.id)}
                disabled={level.locked}
                className={`p-4 rounded-xl border text-left transition-all ${
                  activeLevel === level.id
                    ? 'bg-cyan-500/10 border-cyan-500/30'
                    : level.locked
                    ? 'bg-white/[0.02] border-white/5 opacity-50 cursor-not-allowed'
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <level.icon className={`w-5 h-5 ${
                    activeLevel === level.id ? 'text-cyan-400' : 'text-gray-500'
                  }`} />
                  {level.locked && <Lock className="w-4 h-4 text-gray-500" />}
                </div>
                <h3 className={`font-semibold mb-1 ${
                  activeLevel === level.id ? 'text-white' : 'text-gray-300'
                }`}>
                  {level.name}
                </h3>
                <p className="text-xs text-gray-500">{level.lessons} lessons</p>
                <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-400 rounded-full transition-all"
                    style={{ width: `${(level.completed / level.lessons) * 100}%` }}
                  />
                </div>
              </button>
            ))}
          </div>

          {/* Level Info */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-1">{currentLevel.name}</h2>
            <p className="text-gray-400 text-sm">{currentLevel.description}</p>
          </div>

          {/* Lessons Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FOUNDATION_LESSONS.map((lesson, idx) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-4 border rounded-xl transition-all ${
                  lesson.locked
                    ? 'bg-white/[0.01] border-white/5 opacity-50'
                    : lesson.completed
                    ? 'bg-green-500/5 border-green-500/20'
                    : lesson.inProgress
                    ? 'bg-cyan-500/5 border-cyan-500/20'
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] cursor-pointer'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    lesson.locked
                      ? 'bg-white/5'
                      : lesson.completed
                      ? 'bg-green-500/10'
                      : lesson.inProgress
                      ? 'bg-cyan-500/10'
                      : 'bg-white/5'
                  }`}>
                    {lesson.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : lesson.locked ? (
                      <Lock className="w-5 h-5 text-gray-500" />
                    ) : lesson.inProgress ? (
                      <Play className="w-5 h-5 text-cyan-400" />
                    ) : (
                      <BookOpen className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium mb-1 truncate ${
                      lesson.locked ? 'text-gray-500' : 'text-white'
                    }`}>
                      {lesson.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lesson.duration}
                      </span>
                      {lesson.inProgress && (
                        <span className="text-cyan-400 text-xs">In Progress</span>
                      )}
                    </div>
                  </div>

                  {!lesson.locked && !lesson.completed && (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Coming Soon Notice */}
          <div className="mt-8 p-4 bg-white/[0.02] border border-white/5 rounded-xl text-center">
            <p className="text-gray-400 text-sm">
              More lessons added weekly. Next: Advanced Circuit Analysis
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
