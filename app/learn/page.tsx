'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, CheckCircle2, Clock, PlayCircle } from 'lucide-react'
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
        <div className="w-8 h-8 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const completedCount = lessons.filter((lesson) => lesson.progress?.status === 'completed').length

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Learning Library</h1>
            <p className="text-slate-500">
              Gentle, step-by-step Arduino lessons made for beginners.
            </p>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <div className="rounded border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Total lessons</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{lessons.length}</p>
            </div>
            <div className="rounded border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Completed lessons</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{completedCount}</p>
            </div>
            <div className="rounded border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-500">Current learner</p>
              <p className="mt-1 text-base font-medium text-slate-900">{user?.email}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((lesson) => {
              const status = lesson.progress?.status ?? 'not_started'
              const statusLabel =
                status === 'completed' ? 'Completed' : status === 'in_progress' ? 'Continue' : 'Start'

              return (
                <Link
                  key={lesson.id}
                  href={`/learn/${lesson.slug}`}
                  className="rounded border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
                      {lesson.difficulty}
                    </span>
                    <span className="text-xs text-slate-500">{lesson.required_tier.toUpperCase()}</span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-900">{lesson.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{lesson.summary}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock className="h-4 w-4" />
                      {lesson.estimated_minutes} min
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      {status === 'completed' ? <CheckCircle2 className="h-4 w-4" /> : status === 'in_progress' ? <PlayCircle className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                      {statusLabel}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {lessons.length === 0 && (
            <div className="mt-8 rounded border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
              No lessons are available yet. Run the new Supabase migration to seed the guided Arduino lessons.
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
