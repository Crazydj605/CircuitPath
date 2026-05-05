'use client'

import React, { useState } from 'react'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    tier: 'free',
    price: { monthly: 0, yearly: 0 },
    description: 'Start learning robotics',
    features: [
      '5 beginner lessons',
      'Basic circuit simulator',
      '10 AI tutor messages/day',
      'Community access',
      'Progress tracking',
    ],
  },
  {
    name: 'Pro',
    tier: 'pro',
    price: { monthly: 10, yearly: 8 },
    description: 'For serious learners',
    popular: true,
    features: [
      'All 50+ lessons',
      'Unlimited AI tutoring',
      'Project workspace',
      'Quiz mode & assessments',
      'Priority support',
      'Download resources',
    ],
  },
  {
    name: 'Premium',
    tier: 'premium',
    price: { monthly: 24, yearly: 22 },
    description: 'For professionals',
    features: [
      'Everything in Pro',
      'Live workshops',
      'Certification program',
      'Hardware discounts',
      'Private community',
      '1-on-1 mentoring',
    ],
  },
]

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <section id="pricing" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Start free and upgrade when you're ready. All plans include a 14-day free trial.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-2 p-1 bg-white/5 rounded-full">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                billingCycle === 'monthly' 
                  ? 'bg-white text-[#0a0a0f]' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                billingCycle === 'yearly' 
                  ? 'bg-white text-[#0a0a0f]' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">
                Save $2/mo
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.tier}
              className={`relative p-6 rounded-2xl border ${
                plan.popular
                  ? 'bg-white/[0.03] border-cyan-500/30'
                  : 'bg-white/[0.02] border-white/5'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-6">
                  <span className="px-3 py-1 bg-cyan-500 text-white text-xs font-medium rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-gray-500">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">
                  ${billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly}
                </span>
                <span className="text-gray-500">/mo</span>
              </div>

              {billingCycle === 'yearly' && plan.tier !== 'free' && (
                <p className="text-sm text-gray-500 mb-6">
                  ${plan.price.yearly * 12}/year (save ${(plan.price.monthly - plan.price.yearly) * 12}/year)
                </p>
              )}

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-full font-medium transition-colors ${
                  plan.tier === 'free'
                    ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                    : plan.popular
                    ? 'bg-white text-[#0a0a0f] hover:bg-gray-100'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {plan.tier === 'free' ? 'Get Started Free' : 'Start Free Trial'}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          All plans include a 14-day free trial. Cancel anytime.
        </p>
      </div>
    </section>
  )
}
