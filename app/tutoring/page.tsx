'use client'

import { useState, useEffect } from 'react'
import { Video, Clock, Users, Star, CheckCircle, ArrowRight, Calendar, Zap, BookOpen, MessageSquare } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const FEATURES = [
  { icon: Video, title: 'Live screen share', desc: 'Work through problems together with live screen sharing and real-time debugging.' },
  { icon: BookOpen, title: 'Custom curriculum', desc: 'Sessions are tailored to your level and goals — no generic lessons.' },
  { icon: MessageSquare, title: 'Ask anything', desc: 'Get answers to questions that AI or documentation can\'t fully address.' },
  { icon: Zap, title: 'Hands-on projects', desc: 'Build real circuits and get feedback on your wiring, code, and technique.' },
]

const STEPS = [
  { num: '1', title: 'Pick a time', desc: 'Choose a slot that works for you using the booking calendar below.' },
  { num: '2', title: 'Confirm + prep', desc: 'You\'ll get a confirmation email with a short intake form so I can prepare.' },
  { num: '3', title: 'Join the session', desc: 'We meet on Google Meet or Discord with screen share and live collaboration.' },
]

const PACKAGES = [
  { name: 'Single Session', price: '$29', per: 'one-time', duration: '60 min', features: ['1 live session', 'Session recording', 'Follow-up notes'], highlight: false },
  { name: 'Starter Pack', price: '$79', per: 'one-time', duration: '3 × 60 min', features: ['3 live sessions', 'Session recordings', 'Priority scheduling', 'Email support between sessions'], highlight: true },
  { name: 'Deep Dive', price: '$149', per: 'one-time', duration: '6 × 60 min', features: ['6 live sessions', 'Full recordings archive', 'Priority scheduling', 'Unlimited email support', 'Custom project roadmap'], highlight: false },
]

export default function TutoringPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
    })
  }, [])

  // Replace this URL with your actual Calendly link once set up
  const CALENDLY_URL = process.env.NEXT_PUBLIC_CALENDLY_URL || ''

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-20">
        {/* Hero */}
        <section className="bg-slate-900 text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium mb-6">
              <Star className="w-3 h-3" /> 1-on-1 Tutoring
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Get unstuck — fast
            </h1>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              Personal Arduino & electronics tutoring sessions. Skip the forums and get direct, personalized help from an expert.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {CALENDLY_URL ? (
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-md transition-colors"
                >
                  <Calendar className="w-4 h-4" /> Book a session
                </a>
              ) : (
                <a
                  href="#booking"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-md transition-colors"
                >
                  <Calendar className="w-4 h-4" /> Book a session
                </a>
              )}
              <Link
                href="/learn"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-md transition-colors"
              >
                <BookOpen className="w-4 h-4" /> Try self-paced first
              </Link>
            </div>
          </div>
        </section>

        {/* Social proof strip */}
        <section className="bg-slate-50 border-y border-slate-200 py-5 px-4">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-500" />
              <span><strong className="text-slate-900">200+</strong> sessions completed</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              <span><strong className="text-slate-900">4.9 / 5</strong> avg. rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span><strong className="text-slate-900">60 min</strong> focused sessions</span>
            </div>
          </div>
        </section>

        {/* What you get */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">What you get in each session</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {FEATURES.map(f => (
                <div key={f.title} className="flex gap-4 p-5 bg-slate-50 rounded-md border border-slate-200">
                  <div className="w-10 h-10 bg-white border border-slate-200 rounded-md flex items-center justify-center shrink-0">
                    <f.icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm mb-1">{f.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 px-4 bg-slate-50 border-y border-slate-200">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">How it works</h2>
            <div className="space-y-4">
              {STEPS.map(s => (
                <div key={s.num} className="flex gap-4 items-start">
                  <div className="w-9 h-9 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                    {s.num}
                  </div>
                  <div className="pt-1">
                    <h3 className="font-semibold text-slate-900 mb-0.5">{s.title}</h3>
                    <p className="text-sm text-slate-500">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Simple pricing</h2>
            <p className="text-slate-500 text-sm text-center mb-10">No subscription. Pay once, book whenever.</p>
            <div className="grid sm:grid-cols-3 gap-5">
              {PACKAGES.map(pkg => (
                <div key={pkg.name} className={`rounded-md border p-5 ${pkg.highlight ? 'border-amber-400 bg-amber-50 shadow-md' : 'border-slate-200 bg-white'}`}>
                  {pkg.highlight && (
                    <div className="text-xs font-semibold text-amber-700 bg-amber-200 rounded px-2 py-0.5 w-fit mb-3">Most popular</div>
                  )}
                  <h3 className="font-bold text-slate-900 text-base mb-0.5">{pkg.name}</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-bold text-slate-900">{pkg.price}</span>
                    <span className="text-xs text-slate-400">{pkg.per}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">{pkg.duration}</p>
                  <ul className="space-y-2 mb-5">
                    {pkg.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  {CALENDLY_URL ? (
                    <a
                      href={CALENDLY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block text-center py-2.5 text-sm font-semibold rounded-md transition-colors ${
                        pkg.highlight ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      Book now
                    </a>
                  ) : (
                    <a
                      href="#booking"
                      className={`block text-center py-2.5 text-sm font-semibold rounded-md transition-colors ${
                        pkg.highlight ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      Book now
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Booking calendar */}
        <section id="booking" className="py-16 px-4 bg-slate-50 border-t border-slate-200">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Book your session</h2>
            <p className="text-slate-500 text-sm mb-8">Pick a time that works for you.</p>
            {CALENDLY_URL ? (
              <div className="rounded-md overflow-hidden border border-slate-200 shadow-sm" style={{ height: 700 }}>
                <iframe
                  src={CALENDLY_URL}
                  className="w-full h-full border-0"
                  title="Book a tutoring session"
                />
              </div>
            ) : (
              <div className="bg-white border-2 border-dashed border-slate-300 rounded-md p-12">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-medium">Booking calendar coming soon</p>
                <p className="text-xs text-slate-400 mt-1">
                  Add your Calendly URL via <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">NEXT_PUBLIC_CALENDLY_URL</code> env var
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
