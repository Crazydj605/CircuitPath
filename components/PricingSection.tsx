'use client'

import React, { useEffect, useState } from 'react'
import { Check, ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import AuthModal from './AuthModal'

const plans = {
  free: {
    name: 'Free',
    monthly: 0,
    yearly: 0,
    blurb: 'Great for getting started with the basics.',
    cta: 'Current plan',
    features: [
      'Core beginner lessons',
      'Basic lesson tracking',
      'Community read access',
    ],
  },
  pro: {
    name: 'Pro',
    monthly: 10,
    yearly: 8,
    blurb: 'Best for focused learners who want guided momentum.',
    cta: 'Upgrade to Pro',
    features: [
      'Full guided lesson library',
      'Step checkpoints + troubleshooting',
      'Progress insights and streak tools',
      'Priority lesson updates',
    ],
  },
  max: {
    name: 'Max',
    monthly: 19,
    yearly: 17,
    blurb: 'For power learners who want the deepest support.',
    cta: 'Upgrade to Max',
    features: [
      'Everything in Pro',
      'Advanced project tracks',
      'Deep-dive troubleshooting packs',
      'Early access to new modules',
    ],
  },
}

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
  const [currentTier, setCurrentTier] = useState<'free' | 'pro' | 'max'>('free')
  const [user, setUser] = useState<any>(null)
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .maybeSingle()

      const tier = profile?.subscription_tier
      if (tier === 'pro' || tier === 'max') setCurrentTier(tier)
    }

    init()
  }, [])

  const handleUpgrade = async (tier: 'pro' | 'max') => {
    if (!user) {
      setIsAuthOpen(true)
      return
    }
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, billingCycle }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setIsAuthOpen(true)
    }
  }

  return (
    <>
      <section id="pricing" className="py-24 px-4 bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Pick the plan that matches your pace
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto mb-8">
              Annual billing is selected by default — it shows the lowest monthly cost.
            </p>

            <div className="inline-flex items-center gap-1 p-1 bg-slate-200 rounded">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-5 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2 ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Annual
                <span className="text-xs bg-slate-800 text-white px-1.5 py-0.5 rounded">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {(['free', 'pro', 'max'] as const).map((tier) => {
              const plan = plans[tier]
              const isCurrent = tier === currentTier
              const isPopular = tier === 'pro'
              const price = billingCycle === 'monthly' ? plan.monthly : plan.yearly

              return (
                <div
                  key={tier}
                  className={`relative p-6 rounded-md border ${
                    isPopular
                      ? 'bg-white border-slate-900 shadow-md'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-5">
                      <span className="px-3 py-1 bg-slate-900 text-white text-xs font-medium rounded">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-slate-900 mb-1">{plan.name}</h3>
                    <p className="text-sm text-slate-500">{plan.blurb}</p>
                  </div>

                  <div className="mb-2">
                    <span className="text-4xl font-bold text-slate-900">${price}</span>
                    <span className="text-slate-500 ml-1">/mo</span>
                  </div>

                  {billingCycle === 'yearly' && tier !== 'free' && (
                    <p className="text-xs text-slate-400 mb-6">
                      Billed yearly at ${plan.yearly * 12} — save ${(plan.monthly - plan.yearly) * 12}/year
                    </p>
                  )}
                  {(billingCycle === 'monthly' || tier === 'free') && (
                    <div className="mb-6" />
                  )}

                  <ul className="space-y-3 mb-7">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                        <span className="text-slate-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {tier === 'free' ? (
                    <button
                      disabled={isCurrent}
                      className="w-full py-2.5 rounded-md font-medium text-sm bg-slate-100 text-slate-500 cursor-default"
                    >
                      {isCurrent ? 'Current plan' : 'Get started free'}
                    </button>
                  ) : (
                    <button
                      onClick={() => isCurrent ? undefined : handleUpgrade(tier)}
                      disabled={isCurrent}
                      className={`w-full py-2.5 rounded-md font-medium text-sm transition-colors ${
                        isCurrent
                          ? 'bg-slate-100 text-slate-400 cursor-default'
                          : isPopular
                          ? 'bg-slate-900 text-white hover:bg-slate-800'
                          : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                      }`}
                    >
                      {isCurrent ? 'Current plan' : plan.cta}
                    </button>
                  )}

                  {!isCurrent && tier !== 'free' && (
                    <p className="mt-3 text-xs text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 shrink-0" />
                      Secure checkout · Cancel anytime
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-10 rounded-md border border-slate-200 bg-white p-5">
            <p className="text-sm font-medium text-slate-800 mb-1">Why annual is shown first</p>
            <p className="text-sm text-slate-500">
              Most learners choose annual billing because it lowers monthly cost and removes billing noise —
              so you can stay focused on learning instead of managing subscriptions.
            </p>
          </div>
        </div>
      </section>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  )
}
