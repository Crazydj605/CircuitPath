'use client'

import { useEffect, useState } from 'react'
import { Save, Trash2, ExternalLink, Lock, Cpu, Sparkles, AlertCircle, Plus } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'
import { analytics } from '@/lib/analytics'

type Tier = 'guest' | 'free' | 'pro' | 'max'

type Design = {
  id: string
  name: string
  wokwi_url: string
  notes: string | null
  created_at: string
  updated_at: string
}

type SessionState = {
  tier: Tier
  used: number
  limit: number | typeof Infinity
  remaining: number | typeof Infinity
  allowed: boolean
}

const DEFAULT_WOKWI = 'https://wokwi.com/projects/new/arduino-uno'

async function authedFetch(input: string, init?: RequestInit) {
  const { data: { session } } = await supabase.auth.getSession()
  const headers = new Headers(init?.headers)
  if (session?.access_token) headers.set('Authorization', `Bearer ${session.access_token}`)
  return fetch(input, { ...init, headers })
}

export default function SimulatorPage() {
  const [session, setSession] = useState<SessionState | null>(null)
  const [designs, setDesigns] = useState<Design[]>([])
  const [activeUrl, setActiveUrl] = useState<string>(DEFAULT_WOKWI)
  const [loading, setLoading] = useState(true)
  const [saveOpen, setSaveOpen] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saveNotes, setSaveNotes] = useState('')
  const [saveError, setSaveError] = useState('')
  const [needsAuth, setNeedsAuth] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const [sessRes, designsRes] = await Promise.all([
      authedFetch('/api/simulator/session'),
      authedFetch('/api/simulator/designs'),
    ])
    const sess = await sessRes.json()
    const desData = await designsRes.json()
    setSession(sess)
    setDesigns(desData.designs ?? [])
    setNeedsAuth(sess.tier === 'guest')
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const openSandbox = async () => {
    if (needsAuth) return
    const res = await authedFetch('/api/simulator/session', { method: 'POST' })
    if (res.status === 429) {
      const data = await res.json()
      setSession((prev) =>
        prev ? { ...prev, used: data.used, remaining: 0, allowed: false } : prev
      )
      return
    }
    if (res.ok) {
      analytics.simulatorOpen(activeUrl === DEFAULT_WOKWI ? 'blank' : 'design')
      // Reload session counter
      const next = await authedFetch('/api/simulator/session').then((r) => r.json())
      setSession(next)
    }
  }

  const loadDesign = (d: Design) => {
    setActiveUrl(d.wokwi_url)
  }

  const newBlank = () => {
    setActiveUrl(DEFAULT_WOKWI)
  }

  const handleSave = async () => {
    setSaveError('')
    if (!saveName.trim()) {
      setSaveError('Give your design a name.')
      return
    }
    if (!activeUrl) {
      setSaveError('Open the sandbox first, then click "Save URL" in Wokwi and paste the URL back here.')
      return
    }
    const res = await authedFetch('/api/simulator/designs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: saveName.trim(), wokwi_url: activeUrl, notes: saveNotes.trim() || null }),
    })
    if (res.status === 401) {
      setSaveError('You need to be signed in to save designs.')
      return
    }
    if (res.status === 403 || res.status === 429) {
      const data = await res.json()
      setSaveError(data.error || 'Save failed.')
      return
    }
    if (!res.ok) {
      setSaveError('Save failed. Try again.')
      return
    }
    setSaveOpen(false)
    setSaveName('')
    setSaveNotes('')
    loadData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this saved design?')) return
    await authedFetch(`/api/simulator/designs?id=${id}`, { method: 'DELETE' })
    setDesigns((prev) => prev.filter((d) => d.id !== id))
  }

  const tier = session?.tier ?? 'guest'
  const canSave = tier === 'pro' || tier === 'max'
  const sessionsLeft =
    session && session.tier === 'free' && Number.isFinite(session.limit as number)
      ? Math.max(0, (session.limit as number) - session.used)
      : null

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Simulator Sandbox</h1>
              </div>
              <p className="text-sm text-slate-500">
                Build any Arduino circuit — drag components, write code, hit Run. No real parts needed.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {needsAuth ? (
                <Link
                  href="/"
                  className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-md hover:bg-slate-800 transition-colors"
                >
                  Sign up to use
                </Link>
              ) : (
                <>
                  {tier === 'free' && sessionsLeft !== null && (
                    <span
                      className={`text-xs px-2.5 py-1 rounded-md font-medium ${
                        sessionsLeft === 0
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {sessionsLeft === 0
                        ? 'Daily limit reached'
                        : `${sessionsLeft}/${session?.limit} sessions left today`}
                    </span>
                  )}
                  {(tier === 'pro' || tier === 'max') && (
                    <span className="text-xs px-2.5 py-1 rounded-md font-medium bg-violet-100 text-violet-700">
                      {tier === 'max' ? 'Max · unlimited' : 'Pro · unlimited sessions'}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {needsAuth ? (
            <div className="bg-white border border-slate-200 rounded-md p-12 text-center">
              <Cpu className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-slate-900 mb-2">Sign up to use the simulator</h2>
              <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                Free accounts get 3 sandbox sessions per day. Pro and Max get unlimited sessions plus saved designs.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-md hover:bg-slate-800 transition-colors"
              >
                Get started free
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-4 gap-4">
              {/* Sidebar — saved designs */}
              <aside className="lg:col-span-1 space-y-3">
                <div className="bg-white border border-slate-200 rounded-md p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-900">Saved designs</h3>
                    {canSave && (
                      <span className="text-[10px] text-slate-400">
                        {designs.length}
                        {tier === 'pro' ? ' / 10' : ''}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={newBlank}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium border border-slate-200 rounded hover:bg-slate-50 mb-3"
                  >
                    <Plus className="w-3.5 h-3.5" /> New blank sketch
                  </button>

                  {!canSave && (
                    <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 mb-3">
                      <Lock className="w-3 h-3 mt-0.5 shrink-0" />
                      <div>
                        Saving designs is Pro-only.{' '}
                        <Link href="/pricing" className="font-semibold underline">
                          See plans
                        </Link>
                        .
                      </div>
                    </div>
                  )}

                  {canSave && designs.length === 0 && (
                    <p className="text-xs text-slate-400 italic">
                      No saved designs yet. Build something cool, then click "Save current".
                    </p>
                  )}

                  <ul className="space-y-1.5 max-h-96 overflow-y-auto">
                    {designs.map((d) => (
                      <li
                        key={d.id}
                        className="group flex items-center justify-between gap-2 px-2 py-1.5 rounded hover:bg-slate-50"
                      >
                        <button
                          onClick={() => loadDesign(d)}
                          className="flex-1 text-left text-xs font-medium text-slate-700 truncate"
                        >
                          {d.name}
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-1"
                          aria-label="Delete design"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-violet-50 border border-violet-200 rounded-md p-4 text-xs leading-relaxed text-slate-700">
                  <p className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-600" /> Tip
                  </p>
                  Build your circuit in the sandbox below, then in Wokwi click <b>Save</b> at the top right.
                  Copy the URL and paste it here to save your design to CircuitPath.
                </div>
              </aside>

              {/* Main — sandbox iframe */}
              <section className="lg:col-span-3 space-y-3">
                <div className="bg-white border border-slate-200 rounded-md p-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-xs font-semibold text-slate-500 shrink-0">Current URL:</span>
                    <input
                      value={activeUrl}
                      onChange={(e) => setActiveUrl(e.target.value)}
                      className="flex-1 text-xs px-2 py-1 border border-slate-200 rounded font-mono text-slate-700 min-w-0"
                    />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={openSandbox}
                      disabled={session?.tier === 'free' && session?.allowed === false}
                      className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Start session
                    </button>
                    <a
                      href={activeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 border border-slate-200 text-xs font-semibold rounded hover:bg-slate-50 inline-flex items-center gap-1"
                    >
                      Open in Wokwi <ExternalLink className="w-3 h-3" />
                    </a>
                    {canSave && (
                      <button
                        onClick={() => setSaveOpen((v) => !v)}
                        className="px-3 py-1.5 bg-violet-600 text-white text-xs font-semibold rounded hover:bg-violet-700 inline-flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" /> Save current
                      </button>
                    )}
                  </div>
                </div>

                {saveOpen && (
                  <div className="bg-white border border-violet-200 rounded-md p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-slate-900">Save this design</h3>
                    <input
                      placeholder="Design name (e.g. Blink LED v2)"
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded px-3 py-2"
                    />
                    <textarea
                      placeholder="Optional notes — what you were trying, what you learned…"
                      value={saveNotes}
                      onChange={(e) => setSaveNotes(e.target.value)}
                      rows={2}
                      className="w-full text-sm border border-slate-200 rounded px-3 py-2"
                    />
                    {saveError && (
                      <p className="text-xs text-red-600 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" /> {saveError}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSave}
                        className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setSaveOpen(false)}
                        className="px-3 py-1.5 border border-slate-200 text-xs font-semibold rounded hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {session?.tier === 'free' && session?.allowed === false ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-8 text-center">
                    <Lock className="w-10 h-10 text-amber-600 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-amber-900 mb-1">Daily limit reached</h3>
                    <p className="text-sm text-amber-700 mb-4">
                      Free accounts get {session.limit as number} sandbox sessions per day. Upgrade for unlimited.
                    </p>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-1 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded hover:bg-slate-800"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> See Pro &amp; Max
                    </Link>
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
                    <iframe
                      src={activeUrl}
                      title="Arduino simulator"
                      className="w-full"
                      style={{ height: '70vh', minHeight: 520 }}
                      allow="clipboard-read; clipboard-write"
                    />
                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
                      Powered by Wokwi · {loading ? 'loading…' : `Tier: ${tier}`}
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
