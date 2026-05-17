'use client'

import { useState, useEffect } from 'react'
import { Video, Clock, Users, Star, CheckCircle, ArrowRight, Calendar, Zap, BookOpen, MessageSquare } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const FEATURES = [
  { icon: Video, title: 'Live debugging calls', desc: 'Hop on a video call and share your screen. I\'ll help you troubleshoot circuits, fix code errors, and get your project working.' },
  { icon: BookOpen, title: 'Project planning', desc: 'Not sure how to approach a build? We\'ll plan out your circuit design, component selection, and code structure together.' },
  { icon: MessageSquare, title: 'Idea sharing', desc: 'Bounce ideas around, get feedback on your concepts, and discover new approaches you might not have considered.' },
  { icon: Zap, title: 'Code & circuit review', desc: 'Send me your schematics or code beforehand and I\'ll review it live, pointing out improvements and best practices.' },
]

const STEPS = [
  { num: '1', title: 'Purchase a package', desc: 'Choose the package that fits your needs below. Payment is processed securely via Stripe.' },
  { num: '2', title: 'We\'ll email to schedule', desc: 'After payment, you\'ll receive an email within 24 hours with available time slots that work for you.' },
  { num: '3', title: 'Join the session', desc: 'We meet on Google Meet or Discord with screen share. Come with your questions and your project ready!' },
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

  const CALENDLY_URL = 'https://calendly.com/dominictocco20'

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
              Get help from a real person
            </h1>
            <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
              Stuck on a circuit? Need help planning a project? Want to review your code? 
              Book a live video session and we'll work through it together.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-md transition-colors"
              >
                <Calendar className="w-4 h-4" /> View packages
              </a>
              <Link
                href="/learn"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-md transition-colors"
              >
                <BookOpen className="w-4 h-4" /> Try self-paced first
              </Link>
            </div>
          </div>
        </section>

        {/* Session details strip */}
        <section className="bg-slate-50 border-y border-slate-200 py-5 px-4">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-amber-500" />
              <span><strong className="text-slate-900">Live video</strong> with screen share</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span><strong className="text-slate-900">60 min</strong> focused sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-amber-500" />
              <span><strong className="text-slate-900">Satisfaction</strong> guaranteed</span>
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
        <section id="pricing" className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Simple pricing</h2>
            <p className="text-slate-500 text-sm text-center mb-10">Pay once. We'll email you within 24 hours to schedule your session(s).</p>
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
                  <button
                    className={`w-full block text-center py-2.5 text-sm font-semibold rounded-md transition-colors ${
                      pkg.highlight ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    Purchase & Schedule
                  </button>
                </div>
              ))}
            </div>
            
            {/* Payment info */}
            <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-md text-center">
              <p className="text-sm text-slate-600">
                <strong>How it works:</strong> Click "Purchase & Schedule" to pay via Stripe. 
                After payment, you'll receive an email within 24 hours with available time slots. 
                Sessions are held via Google Meet or Discord.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-4 bg-slate-50 border-t border-slate-200">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Common questions</h2>
            <div className="space-y-4">
              {[
                { q: 'What can I get help with?', a: 'Anything Arduino/electronics related: debugging circuits, code review, project planning, component selection, or just bouncing ideas around.' },
                { q: 'How do I schedule after paying?', a: 'After you purchase a package, you\'ll receive an email within 24 hours with a link to schedule your session(s) at times that work for you.' },
                { q: 'What if I need to reschedule?', a: 'No problem! Just reply to the scheduling email and we\'ll find a new time that works. Reschedules are free with 24 hours notice.' },
                { q: 'What platform do we use?', a: 'We use Google Meet or Discord — whichever you prefer. Both support screen sharing so I can see your circuit or code.' },
                { q: 'Can I get a refund?', a: 'If you\'re not satisfied with your session, let me know and I\'ll make it right — either with a free redo or a full refund.' },
              ].map((faq, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-md p-4">
                  <h3 className="font-semibold text-slate-900 text-sm mb-1">{faq.q}</h3>
                  <p className="text-sm text-slate-500">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
