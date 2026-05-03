'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Crown, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PricingPlan {
  name: string
  tier: 'free' | 'pro' | 'premium'
  price: { monthly: number; yearly: number }
  description: string
  features: string[]
  icon: React.ElementType
  popular?: boolean
}

const plans: PricingPlan[] = [
  {
    name: 'Free',
    tier: 'free',
    price: { monthly: 0, yearly: 0 },
    description: 'Start your robotics journey',
    icon: Zap,
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
    price: { monthly: 9.99, yearly: 99 },
    description: 'Unlock your potential',
    icon: Crown,
    popular: true,
    features: [
      'All 50+ lessons',
      'Advanced circuit simulator',
      'Unlimited AI tutoring',
      'Project workspace',
      'Quiz mode',
      'Priority support',
      'Download resources',
    ],
  },
  {
    name: 'Premium',
    tier: 'premium',
    price: { monthly: 19.99, yearly: 199 },
    description: 'Master robotics',
    icon: Sparkles,
    features: [
      'Everything in Pro',
      '1-on-1 AI mentoring',
      'Live workshops',
      'Certification program',
      'Arduino code export',
      'Hardware discounts',
      'Early access to new features',
      'Private community',
    ],
  },
]

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <section id="pricing" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-2 bg-circuit-accent/10 border border-circuit-accent/30 rounded-full text-circuit-accent text-sm font-medium mb-4">
              Pricing Plans
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Choose Your Learning Path
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Invest in your robotics education. All plans include a 14-day free trial.
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-4 mt-8"
          >
            <button
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                billingCycle === 'monthly'
                  ? 'bg-circuit-accent text-white'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2',
                billingCycle === 'yearly'
                  ? 'bg-circuit-accent text-white'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              Yearly
              <span className="px-2 py-0.5 bg-circuit-success/20 text-circuit-success text-xs rounded-full">
                Save 20%
              </span>
            </button>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.tier}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                'relative p-8 rounded-3xl border',
                plan.popular
                  ? 'bg-gradient-to-b from-circuit-accent/20 to-circuit-panel border-circuit-accent'
                  : 'bg-circuit-panel border-white/10'
              )}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-circuit-accent to-circuit-purple rounded-full text-white text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Icon */}
              <div
                className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center mb-6',
                  plan.popular
                    ? 'bg-circuit-accent/20'
                    : 'bg-white/5'
                )}
              >
                <plan.icon
                  className={cn(
                    'w-7 h-7',
                    plan.popular ? 'text-circuit-accent' : 'text-gray-400'
                  )}
                />
              </div>

              {/* Plan Info */}
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-gray-400 mb-6">{plan.description}</p>

              {/* Price */}
              <div className="mb-8">
                <span className="text-4xl font-bold text-white">
                  ${billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly}
                </span>
                <span className="text-gray-400">
                  /{billingCycle === 'monthly' ? 'month' : 'year'}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                      plan.popular
                        ? 'bg-circuit-accent/20'
                        : 'bg-white/10'
                    )}>
                      <Check className={cn(
                        'w-3 h-3',
                        plan.popular ? 'text-circuit-accent' : 'text-gray-400'
                      )} />
                    </div>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'w-full py-4 rounded-xl font-semibold transition-colors',
                  plan.tier === 'free'
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : plan.popular
                    ? 'bg-gradient-to-r from-circuit-accent to-circuit-purple text-white'
                    : 'bg-circuit-accent/20 text-circuit-accent hover:bg-circuit-accent/30'
                )}
              >
                {plan.tier === 'free' ? 'Get Started Free' : `Start ${plan.name} Trial`}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500"
        >
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-circuit-success" />
            <span>14-day free trial</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-circuit-success" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-circuit-success" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-circuit-success" />
            <span>Money-back guarantee</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
