'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Cpu, Wifi, Bluetooth, Zap, Lock, Sparkles, Crown,
  Check, X, ShoppingCart, Calendar, Ruler, Weight, ExternalLink
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Pinout, { type Pin } from '@/components/Pinout'
import AffiliateLink from '@/components/AffiliateLink'
import { supabase } from '@/lib/supabase'

type Board = {
  id: string
  slug: string
  name: string
  manufacturer: string
  blurb: string
  description_md: string | null
  microcontroller: string | null
  clock_speed_mhz: number | null
  flash_kb: number | null
  ram_kb: number | null
  eeprom_kb: number | null
  digital_pins: number | null
  analog_pins: number | null
  pwm_pins: number | null
  operating_voltage: string | null
  input_voltage: string | null
  price_usd: number | null
  has_wifi: boolean
  has_bluetooth: boolean
  has_usb_c: boolean
  dimensions: string | null
  weight_g: number | null
  release_year: number | null
  good_for: string[] | null
  not_for: string[] | null
  common_projects: string[] | null
  pinout_pins: Pin[] | null
  amazon_url: string | null
  required_tier: 'free' | 'pro' | 'max'
}

function Spec({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div className="p-3 bg-slate-50 border border-slate-100 rounded">
      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{label}</p>
      <p className="text-sm font-semibold text-slate-900 mt-0.5">{value}</p>
    </div>
  )
}

export default function BoardDetail() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const slug = params.slug
  const [board, setBoard] = useState<Board | null>(null)
  const [tier, setTier] = useState<string>('guest')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [{ data: { session } }, { data }] = await Promise.all([
        supabase.auth.getSession(),
        supabase.from('arduino_boards').select('*').eq('slug', slug).eq('is_published', true).maybeSingle(),
      ])
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles').select('subscription_tier').eq('id', session.user.id).maybeSingle()
        setTier(profile?.subscription_tier || 'free')
      }
      setBoard(data as Board | null)
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
      </div>
    )
  }

  if (!board) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="pt-24 px-4 max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Board not found</h1>
          <p className="text-sm text-slate-500 mb-6">We don&rsquo;t have a page for that board yet.</p>
          <Link href="/boards" className="text-sm font-medium text-slate-700 hover:underline">
            ← Back to all boards
          </Link>
        </div>
      </main>
    )
  }

  const isPro = tier === 'pro' || tier === 'premium' || tier === 'max'
  const isMax = tier === 'max' || tier === 'premium'
  const canAccess =
    board.required_tier === 'free' ||
    (board.required_tier === 'pro' && isPro) ||
    (board.required_tier === 'max' && isMax)

  // Locked state — same shape as /learn/[slug] locked screen
  if (!canAccess) {
    const tierLabel = board.required_tier === 'max' ? 'Max' : 'Pro'
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="pt-24 pb-16 px-4 max-w-3xl mx-auto">
          <Link href="/boards" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> All boards
          </Link>

          <div className="bg-slate-900 text-white rounded-md overflow-hidden">
            <div className="px-8 py-10 text-center">
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full text-[11px] font-bold mb-4">
                {board.required_tier === 'max' && <Crown className="w-3 h-3" />}
                {tierLabel.toUpperCase()} ONLY
              </div>
              <h1 className="text-2xl font-bold mb-2">{board.name}</h1>
              <p className="text-slate-300 text-sm leading-relaxed max-w-md mx-auto mb-6">
                {board.blurb}
              </p>

              <ul className="space-y-2 text-left max-w-sm mx-auto mb-8 text-sm">
                <li className="flex items-start gap-2"><Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /> Full spec sheet</li>
                <li className="flex items-start gap-2"><Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /> Interactive pinout diagram</li>
                <li className="flex items-start gap-2"><Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /> When to pick this board (and when not to)</li>
                <li className="flex items-start gap-2"><Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /> Project ideas to get you started</li>
              </ul>

              <Link
                href={`/pricing?source=board-${board.slug}`}
                className="inline-flex items-center gap-1.5 px-6 py-3 bg-amber-400 text-slate-900 font-bold text-sm rounded-md hover:bg-amber-300 transition-colors"
              >
                <Sparkles className="w-4 h-4" /> Upgrade to {tierLabel}
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Unlocked state
  const pins = Array.isArray(board.pinout_pins) ? board.pinout_pins : null

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/boards" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> All boards
          </Link>

          {/* Hero */}
          <div className="bg-white border border-slate-200 rounded-md overflow-hidden mb-6">
            <div className="h-40 bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center relative">
              <Cpu className="w-16 h-16 text-white/30" />
              <div className="absolute top-3 right-3 px-2 py-0.5 bg-white/10 text-white text-[10px] font-bold rounded-full">
                {board.manufacturer.toUpperCase()}
              </div>
            </div>
            <div className="p-6">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">{board.name}</h1>
              <p className="text-slate-600 leading-relaxed mb-4">{board.blurb}</p>
              <div className="flex flex-wrap gap-2">
                {board.has_wifi && (
                  <span className="text-xs px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded-full font-medium flex items-center gap-1">
                    <Wifi className="w-3 h-3" /> WiFi
                  </span>
                )}
                {board.has_bluetooth && (
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium flex items-center gap-1">
                    <Bluetooth className="w-3 h-3" /> Bluetooth
                  </span>
                )}
                {board.has_usb_c && (
                  <span className="text-xs px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full font-medium">
                    USB-C
                  </span>
                )}
                {board.price_usd && (
                  <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                    ~${Number(board.price_usd).toFixed(0)}
                  </span>
                )}
                {board.release_year && (
                  <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {board.release_year}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {board.description_md && (
            <section className="bg-white border border-slate-200 rounded-md p-6 mb-6">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Overview</h2>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {board.description_md}
              </div>
            </section>
          )}

          {/* Specs grid */}
          <section className="bg-white border border-slate-200 rounded-md p-6 mb-6">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Specs at a glance</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Spec label="Microcontroller" value={board.microcontroller} />
              <Spec label="Clock speed" value={board.clock_speed_mhz ? `${board.clock_speed_mhz} MHz` : null} />
              <Spec label="Flash memory" value={board.flash_kb ? `${board.flash_kb} KB` : null} />
              <Spec label="RAM" value={board.ram_kb ? `${board.ram_kb} KB` : null} />
              {board.eeprom_kb !== null && board.eeprom_kb !== undefined && board.eeprom_kb > 0 && (
                <Spec label="EEPROM" value={`${board.eeprom_kb} KB`} />
              )}
              <Spec label="Digital pins" value={board.digital_pins} />
              <Spec label="Analog pins" value={board.analog_pins} />
              {board.pwm_pins !== null && <Spec label="PWM pins" value={board.pwm_pins} />}
              <Spec label="Operating voltage" value={board.operating_voltage} />
              <Spec label="Input voltage" value={board.input_voltage} />
              <Spec label="Size" value={board.dimensions} />
              {board.weight_g && <Spec label="Weight" value={`${board.weight_g} g`} />}
            </div>
          </section>

          {/* Pinout */}
          <section className="bg-white border border-slate-200 rounded-md p-6 mb-6">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Interactive pinout</h2>
            {pins && pins.length > 0 ? (
              <Pinout pins={pins} boardName={board.name} />
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-md border border-dashed border-slate-200">
                <Ruler className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">Pinout diagram coming soon</p>
                <p className="text-xs text-slate-400 mt-1">
                  We&rsquo;re adding interactive pinouts board by board. Uno first.
                </p>
              </div>
            )}
          </section>

          {/* Good for / Not for */}
          {(board.good_for?.length || board.not_for?.length) && (
            <section className="grid sm:grid-cols-2 gap-4 mb-6">
              {board.good_for && board.good_for.length > 0 && (
                <div className="bg-white border border-green-200 rounded-md p-5">
                  <h3 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Good for
                  </h3>
                  <ul className="space-y-2">
                    {board.good_for.map((g, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0" />
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {board.not_for && board.not_for.length > 0 && (
                <div className="bg-white border border-red-200 rounded-md p-5">
                  <h3 className="text-xs font-bold text-red-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <X className="w-3.5 h-3.5" /> Not for
                  </h3>
                  <ul className="space-y-2">
                    {board.not_for.map((n, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0" />
                        {n}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {/* Common projects */}
          {board.common_projects && board.common_projects.length > 0 && (
            <section className="bg-white border border-slate-200 rounded-md p-6 mb-6">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Common project ideas</h2>
              <div className="flex flex-wrap gap-2">
                {board.common_projects.map((p, i) => (
                  <span key={i} className="text-sm px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full">
                    {p}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Buy CTA */}
          {board.amazon_url && (
            <section className="bg-amber-50 border border-amber-200 rounded-md p-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <ShoppingCart className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-amber-900">Ready to grab one?</p>
                  <p className="text-xs text-amber-700">
                    {board.price_usd ? `Typically around $${Number(board.price_usd).toFixed(0)}.` : 'See current price on Amazon.'}
                  </p>
                </div>
              </div>
              <AffiliateLink
                href={board.amazon_url}
                product={`board:${board.slug}`}
                className="shrink-0 px-4 py-2 bg-amber-500 text-white text-xs font-semibold rounded hover:bg-amber-600 transition-colors inline-flex items-center gap-1"
              >
                Buy on Amazon <ExternalLink className="w-3 h-3" />
              </AffiliateLink>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
