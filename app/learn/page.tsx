'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, CheckCircle2, Clock, PlayCircle, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import { getLessonLibrary } from '@/lib/learning'
import type { LearningLesson, LearningUserLessonProgress } from '@/types'

export default function Learn() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lessons, setLessons] = useState<Array<LearningLesson & { progress: LearningUserLessonProgress | null }>>([])

  useEffect(() => {
    const bootstrap = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
        return
      }
      setUser(session.user)
      const library = await getLessonLibrary()
      setLessons(library)
      setLoading(false)
    }
    bootstrap()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const completedCount = lessons.filter((l) => l.progress?.status === 'completed').length
  const inProgressCount = lessons.filter((l) => l.progress?.status === 'in_progress').length

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Learning Library</h1>
            <p className="text-slate-500 text-sm">
              Step-by-step lessons made for beginners. Work at your own pace.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white border border-slate-200 rounded-md p-4">
              <p className="text-xs text-slate-400 mb-1">Total lessons</p>
              <p className="text-2xl font-bold text-slate-900">{lessons.length}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-md p-4">
              <p className="text-xs text-slate-400 mb-1">In progress</p>
              <p className="text-2xl font-bold text-slate-900">{inProgressCount}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-md p-4">
              <p className="text-xs text-slate-400 mb-1">Completed</p>
              <p className="text-2xl font-bold text-slate-900">{completedCount}</p>
            </div>
          </div>

          {/* Lesson grid */}
          {lessons.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lessons.map((lesson) => {
                const status = lesson.progress?.status ?? 'not_started'
                const isCompleted = status === 'completed'
                const isInProgress = status === 'in_progress'

                return (
                  <Link
                    key={lesson.id}
                    href={`/learn/${lesson.slug}`}
                    className={`group bg-white border rounded-md p-5 hover:shadow-sm transition-all ${
                      isCompleted
                        ? 'border-slate-200 opacity-80'
                        : isInProgress
                        ? 'border-slate-900'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {lesson.difficulty}
                        </span>
                        <span className="text-xs text-slate-400 uppercase">
                          {lesson.required_tier}
                        </span>
                      </div>
                      {isInProgress && (
                        <span className="text-xs bg-slate-900 text-white px-2 py-0.5 rounded">
                          In progress
                        </span>
                      )}
                      {isCompleted && (
                        <CheckCircle2 className="w-4 h-4 text-slate-400" />
                      )}
                    </div>

                    <h3 className="text-base font-semibold text-slate-900 mb-1 group-hover:text-slate-700">
                      {lesson.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">
                      {lesson.summary}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        {lesson.estimated_minutes} min
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs font-medium ${
                        isCompleted ? 'text-slate-400' : 'text-slate-700'
                      }`}>
                        {isCompleted ? (
                          <><CheckCircle2 className="h-3.5 w-3.5" /> Done</>
                        ) : isInProgress ? (
                          <><PlayCircle className="h-3.5 w-3.5" /> Continue</>
                        ) : (
                          <><BookOpen className="h-3.5 w-3.5" /> Start</>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="mt-6 bg-white border border-slate-200 rounded-md p-8 text-center">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500 mb-1">No lessons available yet.</p>
              <p className="text-xs text-slate-400">Run the Supabase migration to seed lessons, then refresh this page.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
