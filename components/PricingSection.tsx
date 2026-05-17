'use client'

import React, { useEffect, useState } from 'react'
import { Check, ShieldCheck, Zap, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import AuthModal from './AuthModal'

// ─── Plan data ───────────────────────────────────────────────────
const plans = {
  free: {
    name: 'Free',
    regularMonthly: 0,
    regularYearly: 0,
    saleMonthly: 0,
    saleYearly: 0,
    blurb: 'Try it out — no credit card needed.',
    cta: 'Get started free',
    features: [
      '2 free beginner lessons',
      'Basic lesson tracking',
      'Community read access',
    ],
  },
  pro: {
    name: 'Pro',
    regularMonthly: 14.99,
    regularYearly: 11.99,
    saleMonthly: 8.99,
    saleYearly: 6.99,
    blurb: 'The complete learning experience. Most learners choose this.',
    cta: 'Claim 40% Off — Upgrade to Pro',
    features: [
      'Full lesson library (all 6+ lessons)',
      'Wokwi circuit simulator (visual learning)',
      'Step checkpoints + troubleshooting guides',
      'Progress tracking and streak tools',
      'Community challenges and leaderboard',
      'New lessons added every month',
      'Priority support',
    ],
  },
  max: {
    name: 'Max',
    regularMonthly: 24.99,
    regularYearly: 19.99,
    saleMonthly: 14.99,
    saleYearly: 11.99,
    blurb: 'For power learners who want the deepest support.',
    cta: 'Upgrade to Max',
    features: [
      'Everything in Pro',
      'Wokwi circuit simulator (visual learning)',
      'Free unlimited certificates',
      'AI Tutor access (chat with AI expert)',
      'Advanced project tracks',
      'Deep-dive troubleshooting packs',
      'Early access to new modules',
      'Direct Q&A sessions',
      'Exclusive Max-only badges',
    ],
  },
}

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
  const [currentTier, setCurrentTier] = useState<'free' | 'pro' | 'max'>('free')
  const [user, setUser] = useState<any>(null)
  const [userToken, setUserToken] = useState<string | null>(null)
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setUserToken(session?.access_token ?? null)
      if (!session?.user) return
      const { data: profile } = await supabase
        .from('profiles').select('subscription_tier').eq('id', session.user.id).maybeSingle()
      const tier = profile?.subscription_tier
      if (tier === 'pro' || tier === 'max') setCurrentTier(tier)
    }
    init()
  }, [])

  const handleUpgrade = async (tier: 'pro' | 'max') => {
    if (!user) { setIsAuthOpen(true); return }
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, billingCycle, userToken }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      setIsAuthOpen(true)
    }
  }

  return (
    <>
      <section id="pricing" className="py-24 px-4 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto">

          {/* ── Section header ── */}
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
              Pick the plan that matches your pace
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto mb-7">
              Start free, upgrade when you're ready. Annual billing saves you even more.
            </p>

            <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-md border border-slate-200">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-5 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Annual
                <span className="text-xs bg-green-600 text-white px-1.5 py-0.5 rounded">
                  Best value
                </span>
              </button>
            </div>
          </div>

          {/* ── Cards ── */}
          <div className="grid md:grid-cols-3 gap-5 items-start">
            {(['free', 'pro', 'max'] as const).map((tier) => {
              const plan = plans[tier]
              const isCurrent = tier === currentTier
              const isPopular = tier === 'pro'
              const regularPrice = billingCycle === 'monthly' ? plan.regularMonthly : plan.regularYearly
              const salePrice   = billingCycle === 'monthly' ? plan.saleMonthly   : plan.saleYearly

              return (
                <div
                  key={tier}
                  className={`relative rounded-md border overflow-hidden ${
                    isPopular
                      ? 'border-slate-900 shadow-xl ring-1 ring-slate-900'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Popular ribbon */}
                  {isPopular && (
                    <div className="bg-slate-900 px-5 py-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-white tracking-wide uppercase">Most Popular</span>
                      <span className="text-xs bg-amber-400 text-slate-900 font-bold px-2 py-0.5 rounded">40% OFF</span>
                    </div>
                  )}

                  <div className="bg-white p-6">
                    <div className="mb-5">
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
                      <p className="text-sm text-slate-500">{plan.blurb}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-5">
                      {tier === 'free' ? (
                        <div>
                          <span className="text-4xl font-bold text-slate-900">$0</span>
                          <span className="text-slate-500 ml-1 text-sm">/month</span>
                          <p className="text-xs text-slate-400 mt-1">Free forever</p>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-slate-400 line-through text-lg">${regularPrice}</span>
                            <span className="text-4xl font-bold text-slate-900">${salePrice}</span>
                            <span className="text-slate-500 text-sm">/mo</span>
                          </div>
                          {billingCycle === 'yearly' && (
                            <p className="text-xs text-green-600 mt-1 font-medium">
                              Billed ${(salePrice * 12).toFixed(0)}/year — save ${((regularPrice - salePrice) * 12).toFixed(0)} per year
                            </p>
                          )}
                          {billingCycle === 'monthly' && (
                            <p className="text-xs text-slate-400 mt-1">Switch to annual to save even more</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-7">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isPopular ? 'text-slate-900' : 'text-slate-500'}`} />
                          <span className="text-slate-600 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    {tier === 'free' ? (
                      <button
                        disabled={isCurrent}
                        className="w-full py-2.5 rounded-md text-sm font-medium bg-slate-100 text-slate-500 cursor-default"
                      >
                        {isCurrent ? 'Your current plan' : 'Get started free'}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => !isCurrent && handleUpgrade(tier)}
                          disabled={isCurrent}
                          className={`w-full py-3 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                            isCurrent
                              ? 'bg-slate-100 text-slate-400 cursor-default'
                              : isPopular
                              ? 'bg-slate-900 text-white hover:bg-slate-800'
                              : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                          }`}
                        >
                          {isCurrent ? 'Your current plan' : plan.cta}
                          {!isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
                        </button>
                        {!isCurrent && (
                          <p className="mt-2.5 text-xs text-slate-400 flex items-center gap-1.5">
                            <ShieldCheck className="h-3 w-3 shrink-0" />
                            Secure checkout · Cancel anytime
                          </p>
                        )}
                        {isPopular && !isCurrent && (
                          <p className="mt-2 text-xs text-amber-600 font-medium flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Sale price locks in — won't increase on renewal
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Bottom trust line ── */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-5 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> No credit card for Free plan</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Cancel anytime, no questions asked</span>
            <span className="flex items-center gap-1.5"><Check className="w-4 h-4" /> Instant access after payment</span>
          </div>

        </div>
      </section>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  )
}
