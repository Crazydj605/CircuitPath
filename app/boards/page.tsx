'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Cpu, Lock, Wifi, Bluetooth, Sparkles, Crown } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { supabase } from '@/lib/supabase'

type Board = {
  slug: string
  name: string
  manufacturer: string
  blurb: string
  microcontroller: string | null
  clock_speed_mhz: number | null
  operating_voltage: string | null
  price_usd: number | null
  has_wifi: boolean
  has_bluetooth: boolean
  required_tier: 'free' | 'pro' | 'max'
  order_index: number
}

function tierStyle(tier: string) {
  if (tier === 'max') return 'bg-violet-100 text-violet-700'
  if (tier === 'pro') return 'bg-blue-100 text-blue-700'
  return 'bg-green-100 text-green-700'
}

function tierLabel(tier: string) {
  if (tier === 'max') return 'MAX'
  if (tier === 'pro') return 'PRO'
  return 'FREE'
}

export default function BoardsIndex() {
  const [boards, setBoards] = useState<Board[]>([])
  const [tier, setTier] = useState<string>('guest')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', session.user.id)
          .maybeSingle()
        setTier(profile?.subscription_tier || 'free')
      }
      const { data: list } = await supabase
        .from('arduino_boards')
        .select('slug, name, manufacturer, blurb, microcontroller, clock_speed_mhz, operating_voltage, price_usd, has_wifi, has_bluetooth, required_tier, order_index')
        .eq('is_published', true)
        .order('order_index', { ascending: true })
      setBoards((list as Board[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const isPro = tier === 'pro' || tier === 'premium' || tier === 'max'
  const isMax = tier === 'max' || tier === 'premium'

  const canAccess = (b: Board) => {
    if (b.required_tier === 'free') return true
    if (b.required_tier === 'pro') return isPro
    if (b.required_tier === 'max') return isMax
    return false
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-600 mb-3">
              <Cpu className="w-3.5 h-3.5" /> Reference
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Know your boards</h1>
            <p className="text-slate-500 text-sm max-w-2xl mx-auto leading-relaxed">
              The Arduino ecosystem isn&rsquo;t one board — it&rsquo;s a family of microcontrollers,
              each tuned for different jobs. Pick the right one and your project gets easier.
              Pick the wrong one and you&rsquo;ll fight your hardware for weeks. Browse them all
              below.
            </p>
          </div>

          {/* Tier legend */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 text-xs">
            <span className="text-slate-500">Tiers:</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold">FREE</span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-semibold">PRO</span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full font-semibold">MAX</span>
          </div>

          {/* Boards grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((b) => {
              const locked = !canAccess(b)
              const href = locked ? `/pricing?source=boards-${b.slug}` : `/boards/${b.slug}`
              return (
                <Link
                  key={b.slug}
                  href={href}
                  className={`group relative bg-white border rounded-md overflow-hidden transition-all ${
                    locked
                      ? 'border-slate-200 hover:border-violet-300 hover:shadow-sm'
                      : 'border-slate-200 hover:border-slate-400 hover:shadow-md'
                  }`}
                >
                  {/* Visual top */}
                  <div className={`h-32 relative flex items-center justify-center ${
                    locked
                      ? 'bg-gradient-to-br from-slate-50 to-slate-100'
                      : 'bg-gradient-to-br from-slate-900 to-slate-700'
                  }`}>
                    {locked ? (
                      <Lock className="w-10 h-10 text-slate-300" />
                    ) : (
                      <Cpu className="w-12 h-12 text-white/40" />
                    )}
                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${tierStyle(b.required_tier)}`}>
                      {b.required_tier === 'max' && <Crown className="w-2.5 h-2.5" />}
                      {tierLabel(b.required_tier)}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-sm font-bold text-slate-900 mb-0.5">{b.name}</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-2">
                      {b.manufacturer}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-3">
                      {b.blurb}
                    </p>

                    {/* Spec chips */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {b.clock_speed_mhz && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {b.clock_speed_mhz} MHz
                        </span>
                      )}
                      {b.operating_voltage && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {b.operating_voltage}
                        </span>
                      )}
                      {b.has_wifi && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-cyan-100 text-cyan-700 rounded flex items-center gap-0.5">
                          <Wifi className="w-2.5 h-2.5" /> WiFi
                        </span>
                      )}
                      {b.has_bluetooth && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded flex items-center gap-0.5">
                          <Bluetooth className="w-2.5 h-2.5" /> BT
                        </span>
                      )}
                      {b.price_usd && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">
                          ~${Number(b.price_usd).toFixed(0)}
                        </span>
                      )}
                    </div>

                    {locked ? (
                      <div className="text-xs font-semibold text-violet-700 group-hover:text-violet-900 transition-colors flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Unlock with {b.required_tier === 'max' ? 'Max' : 'Pro'}
                      </div>
                    ) : (
                      <div className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                        View board →
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Footer CTA */}
          {tier !== 'max' && tier !== 'premium' && (
            <div className="mt-12 bg-gradient-to-br from-violet-50 to-amber-50 border border-violet-200 rounded-md p-6 text-center">
              <h3 className="text-base font-bold text-slate-900 mb-1">More boards coming weekly</h3>
              <p className="text-sm text-slate-600 mb-4 max-w-md mx-auto">
                We&rsquo;re adding deep-dive board pages every week — pinouts, project recipes, and the&nbsp;
                &ldquo;when to pick this one&rdquo; guides you can&rsquo;t Google in five minutes.
                {tier === 'guest' && ' Sign up free to start.'}
              </p>
              <Link
                href={tier === 'guest' ? '/' : '/pricing'}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-md hover:bg-slate-800 transition-colors"
              >
                {tier === 'guest' ? 'Get started free' : 'See plans'}
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
