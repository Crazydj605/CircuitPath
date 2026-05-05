'use client'

import React, { useEffect, useState } from 'react'
import { Check, ShieldCheck, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const plans = {
  free: {
    name: 'Free',
    monthly: 0,
    yearly: 0,
    blurb: 'Great for getting started with Arduino basics.',
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

  useEffect(() => {
    const readTier = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .maybeSingle()

      const tier = profile?.subscription_tier
      if (tier === 'pro' || tier === 'max') setCurrentTier(tier)
    }

    readTier()
  }, [])

  return (
    <section id="pricing" className="py-24 px-4 bg-white border-y border-slate-200">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Pick the plan that matches your pace
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto mb-8">
            Annual billing is selected by default to show your lowest monthly cost.
          </p>

          <div className="inline-flex items-center gap-2 p-1 bg-slate-100 rounded-full">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                billingCycle === 'monthly' 
                  ? 'bg-white text-slate-900' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                billingCycle === 'yearly' 
                  ? 'bg-white text-slate-900' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Annual
              <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                Lower monthly cost
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {(['free', 'pro', 'max'] as const).map((tier) => {
            const plan = plans[tier]
            const isCurrent = tier === currentTier
            const isPopular = tier === 'pro' && billingCycle === 'yearly'
            const monthlyValue = billingCycle === 'monthly' ? plan.monthly : plan.yearly

            return (
            <div
              key={tier}
              className={`relative p-6 rounded-2xl border ${
                isPopular
                  ? 'bg-slate-50 border-slate-400'
                  : 'bg-white border-slate-200'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-6">
                  <span className="px-3 py-1 bg-slate-900 text-white text-xs font-medium rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-1">{plan.name}</h3>
                <p className="text-sm text-slate-500">{plan.blurb}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">
                  ${monthlyValue}
                </span>
                <span className="text-slate-500">/mo</span>
              </div>

              {billingCycle === 'yearly' && tier !== 'free' && (
                <p className="text-sm text-slate-500 mb-6">
                  Billed yearly at ${plan.yearly * 12}. Save ${(plan.monthly - plan.yearly) * 12}/year.
                </p>
              )}

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
                    <span className="text-slate-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={isCurrent}
                className={`w-full py-3 rounded-full font-medium transition-colors ${
                  isCurrent
                    ? 'bg-slate-200 text-slate-500 cursor-default'
                    : isPopular
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                }`}
              >
                {isCurrent ? 'Current plan' : plan.cta}
              </button>

              {!isCurrent && (
                <p className="mt-3 text-xs text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Secure billing integration can be connected later in Stripe setup.
                </p>
              )}
            </div>
          )})}
        </div>

        <div className="mt-12 rounded border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-center gap-2 text-slate-800">
            <Sparkles className="h-4 w-4" />
            <p className="text-sm font-semibold">Why annual is shown first</p>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Most learners pick annual because it lowers monthly cost and removes billing noise while you stay focused on learning.
          </p>
        </div>
      </div>
    </section>
  )
}
