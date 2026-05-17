'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Wrench, Sparkles, Lock, Clock, Layers, ExternalLink, Crown } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { analytics } from '@/lib/analytics'

type WorkshopProject = {
  id: string
  slug: string
  title: string
  blurb: string
  wokwi_url: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimated_minutes: number | null
  components: string[] | null
  order_index: number
}

function difficultyColor(d: string) {
  switch (d) {
    case 'beginner':     return 'bg-green-100 text-green-700'
    case 'intermediate': return 'bg-amber-100 text-amber-700'
    case 'advanced':     return 'bg-red-100 text-red-700'
    default:             return 'bg-slate-100 text-slate-700'
  }
}

export default function WorkshopPage() {
  const [projects, setProjects] = useState<WorkshopProject[]>([])
  const [tier, setTier] = useState<string>('free')
  const [isGuest, setIsGuest] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setIsGuest(false)
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', session.user.id)
          .maybeSingle()
        setTier(profile?.subscription_tier || 'free')
      }
      const { data: list } = await supabase
        .from('workshop_projects')
        .select('id, slug, title, blurb, wokwi_url, difficulty, estimated_minutes, components, order_index')
        .eq('is_published', true)
        .order('order_index', { ascending: true })
      setProjects(list ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const isMax = tier === 'max'

  const handleOpen = (proj: WorkshopProject) => {
    analytics.simulatorOpen(`workshop:${proj.slug}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-semibold mb-3">
              <Crown className="w-3.5 h-3.5" /> Max only
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">The Workshop</h1>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              A growing library of hand-picked build projects. Click any project to jump into the simulator
              with the full circuit and starter code already loaded — no real parts needed.
            </p>
          </div>

          {/* Lock state for non-Max */}
          {!isMax && (
            <div className="mb-8 bg-gradient-to-br from-violet-50 to-amber-50 border border-violet-200 rounded-md p-6">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    {isGuest ? 'Workshop is for Max subscribers' : `You're on ${tier} — Workshop is Max-only`}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    The Workshop is the deep end of CircuitPath — long-form build projects with full schematics,
                    parts lists, and one-click simulator launches. Available exclusively on Max.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-md hover:bg-slate-800 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Upgrade to Max
                    </Link>
                    <span className="text-xs text-slate-500">
                      {projects.length} projects available · 1–2 new ones added every week
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Projects grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((proj) => {
              const locked = !isMax
              return (
                <div
                  key={proj.id}
                  className={`relative bg-white border rounded-md overflow-hidden transition-all ${
                    locked ? 'border-slate-200 opacity-90' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  {/* Thumbnail-ish header */}
                  <div className="h-24 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center relative">
                    <Wrench className="w-10 h-10 text-slate-300" />
                    {locked && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                        <Crown className="w-2.5 h-2.5" /> MAX
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${difficultyColor(proj.difficulty)}`}>
                        {proj.difficulty}
                      </span>
                      {proj.estimated_minutes && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                          <Clock className="w-3 h-3" /> {proj.estimated_minutes} min
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-1.5">{proj.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-3">
                      {proj.blurb}
                    </p>

                    {proj.components && proj.components.length > 0 && (
                      <div className="flex items-start gap-1.5 mb-3">
                        <Layers className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-[10px] text-slate-500 leading-snug">
                          {proj.components.slice(0, 4).join(' · ')}
                          {proj.components.length > 4 && ` · +${proj.components.length - 4}`}
                        </p>
                      </div>
                    )}

                    {locked ? (
                      <Link
                        href="/pricing"
                        className="block w-full text-center text-xs font-semibold py-2 bg-slate-100 text-slate-500 rounded hover:bg-slate-200 transition-colors"
                      >
                        Unlock with Max
                      </Link>
                    ) : (
                      <a
                        href={proj.wokwi_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleOpen(proj)}
                        className="block w-full text-center text-xs font-semibold py-2 bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors inline-flex items-center justify-center gap-1"
                      >
                        Open in simulator <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {projects.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Wrench className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">More projects coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
