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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const currentLevel = LEVELS.find(l => l.id === activeLevel) || LEVELS[0]

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Learning Library</h1>
            <p className="text-slate-500">
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
                    ? 'bg-slate-100 border-slate-300'
                    : level.locked
                    ? 'bg-white border-slate-200 opacity-50 cursor-not-allowed'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <level.icon className={`w-5 h-5 ${
                    activeLevel === level.id ? 'text-slate-700' : 'text-slate-500'
                  }`} />
                  {level.locked && <Lock className="w-4 h-4 text-slate-400" />}
                </div>
                <h3 className={`font-semibold mb-1 ${
                  activeLevel === level.id ? 'text-slate-900' : 'text-slate-700'
                }`}>
                  {level.name}
                </h3>
                <p className="text-xs text-slate-500">{level.lessons} lessons</p>
                <div className="mt-2 h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-slate-600 rounded-full transition-all"
                    style={{ width: `${(level.completed / level.lessons) * 100}%` }}
                  />
                </div>
              </button>
            ))}
          </div>

          {/* Level Info */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-1">{currentLevel.name}</h2>
            <p className="text-slate-500 text-sm">{currentLevel.description}</p>
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
                    ? 'bg-white border-slate-200 opacity-50'
                    : lesson.completed
                    ? 'bg-slate-100 border-slate-300'
                    : lesson.inProgress
                    ? 'bg-slate-100 border-slate-300'
                    : 'bg-white border-slate-200 hover:bg-slate-50 cursor-pointer'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    lesson.locked
                      ? 'bg-slate-100'
                      : lesson.completed
                      ? 'bg-slate-200'
                      : lesson.inProgress
                      ? 'bg-slate-200'
                      : 'bg-slate-100'
                  }`}>
                    {lesson.completed ? (
                      <CheckCircle className="w-5 h-5 text-slate-700" />
                    ) : lesson.locked ? (
                      <Lock className="w-5 h-5 text-slate-400" />
                    ) : lesson.inProgress ? (
                      <Play className="w-5 h-5 text-slate-700" />
                    ) : (
                      <BookOpen className="w-5 h-5 text-slate-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium mb-1 truncate ${
                      lesson.locked ? 'text-slate-400' : 'text-slate-900'
                    }`}>
                      {lesson.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lesson.duration}
                      </span>
                      {lesson.inProgress && (
                        <span className="text-slate-700 text-xs">In Progress</span>
                      )}
                    </div>
                  </div>

                  {!lesson.locked && !lesson.completed && (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Coming Soon Notice */}
          <div className="mt-8 p-4 bg-white border border-slate-200 rounded text-center">
            <p className="text-slate-500 text-sm">
              More lessons added weekly. Next: Advanced Circuit Analysis
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
