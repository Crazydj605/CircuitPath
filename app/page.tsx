'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Zap, ArrowRight, CheckCircle2, BookOpen, MessageSquare,
  Target, Users, Award, Play, Trophy,
  ExternalLink, ShoppingCart, Cpu, Lightbulb, Layers,
  Star, Flame
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import PricingSection from '@/components/PricingSection'
import { supabase } from '@/lib/supabase'

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Structured Curriculum',
    description: 'Progressive learning path from basic circuits to advanced robotics systems.',
  },
  {
    icon: Target,
    title: 'Project-Based Learning',
    description: 'Build real projects with step-by-step guidance and troubleshooting support at every stage.',
  },
  {
    icon: MessageSquare,
    title: 'AI Tutor',
    description: 'Get instant answers from our AI tutor when you get stuck on any concept.',
  },
  {
    icon: Users,
    title: 'Peer Community',
    description: 'Connect with fellow learners, share projects, and collaborate on challenges.',
  },
  {
    icon: Award,
    title: 'Skill Certificates',
    description: 'Earn verifiable certificates as you complete modules and demonstrate mastery.',
  },
  {
    icon: Play,
    title: 'Virtual Lab',
    description: 'Test circuits safely in simulation before building with physical components.',
  },
]

const STATS = [
  { value: '6+', label: 'Real Lessons' },
  { value: '3', label: 'Difficulty Levels' },
  { value: 'AI', label: 'Powered Tutor' },
  { value: 'Free', label: 'Plan Available' },
]

const BETA_PERKS = [
  { emoji: '🎓', title: '3 Months Pro Free', desc: 'Leave a real review of your experience — good or bad — and get 3 months Pro at no cost.' },
  { emoji: '🔧', title: 'Shape the Platform', desc: 'Your feedback directly influences what we build next. Early users get the most influence.' },
  { emoji: '🏆', title: 'Founding Member Badge', desc: 'Beta users get an exclusive "Founding Member" badge that will never be available again.' },
]

const LEARNING_MILESTONES = [
  {
    level: 'Foundation',
    duration: 'Weeks 1–4',
    skills: ['Circuit basics', "Ohm's Law", 'Component identification', 'Breadboarding'],
    project: 'LED Light Show',
    xp: '500 XP',
  },
  {
    level: 'Circuit Design',
    duration: 'Weeks 5–8',
    skills: ['Resistor networks', 'Capacitors', 'Switches & logic', 'Power management'],
    project: 'Digital Dice',
    xp: '1,200 XP',
  },
  {
    level: 'Programming',
    duration: 'Weeks 9–12',
    skills: ['Arduino basics', 'C++ fundamentals', 'Sensor integration', 'Serial comms'],
    project: 'Temperature Monitor',
    xp: '2,500 XP',
  },
  {
    level: 'Automation',
    duration: 'Weeks 13–16',
    skills: ['Motor control', 'PID loops', 'Wireless comms', 'System integration'],
    project: 'Line Following Robot',
    xp: '5,000 XP',
  },
]

const BADGES = [
  { name: 'First Circuit', description: 'Complete your first working circuit', icon: Lightbulb },
  { name: '7-Day Streak', description: 'Learn for 7 consecutive days', icon: Flame },
  { name: 'Project Master', description: 'Complete 10 hands-on projects', icon: Trophy },
  { name: 'Community Helper', description: 'Answer 5 peer questions', icon: Users },
  { name: 'Debug Expert', description: 'Troubleshoot and fix 3 broken circuits', icon: Cpu },
  { name: 'Level 50', description: 'Reach 50,000 XP total', icon: Layers },
]

const AMAZON_KITS = [
  {
    name: 'Beginner Electronics Kit',
    description: 'Breadboard, resistors, LEDs, wires, and basic components for Foundation level',
    price: '$29.99',
    link: 'https://www.amazon.com/s?tag=circuitpath-20&k=beginner+electronics+kit+breadboard+LEDs+resistors+jumper+wires',
    level: 'Foundation',
    essentials: ['Breadboard', 'Resistors (220Ω–10kΩ)', 'LEDs (5 colors)', 'Jumper wires', '9V battery clip'],
  },
  {
    name: 'Arduino Starter Kit',
    description: 'Arduino Uno, sensors, motors, and components for Programming level',
    price: '$89.99',
    link: 'https://www.amazon.com/s?tag=circuitpath-20&k=arduino+uno+starter+kit+sensors+servo+motor+LCD',
    level: 'Programming',
    essentials: ['Arduino Uno R3', 'USB cable', 'Temperature sensor', 'Servo motor', 'LCD display'],
  },
  {
    name: 'Advanced Robotics Kit',
    description: 'Motors, motor drivers, chassis, and components for Automation level',
    price: '$149.99',
    link: 'https://www.amazon.com/s?tag=circuitpath-20&k=arduino+robotics+kit+robot+chassis+motor+driver+IR+sensors',
    level: 'Automation',
    essentials: ['Robot chassis', 'DC motors (2)', 'Motor driver', 'IR sensors (5)', 'Wheels & caster'],
  },
]

const COMPARISON_FEATURES = [
  'Structured learning path',
  'Component kit recommendations',
  'Progress milestones & tracking',
  'Achievement badges & rewards',
  'Community challenges & leaderboards',
  'Verified skill certificates',
  'AI troubleshooting support',
  'Peer project feedback',
]

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // If Supabase redirects OAuth tokens to the homepage instead of /auth/callback,
    // detect the session here and forward to dashboard.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) router.replace('/dashboard')
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard')
    })
    return () => subscription.unsubscribe()
  }, [router])

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 border-b border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-sm text-slate-600 mb-8">
              <Zap className="w-3.5 h-3.5 text-slate-500" />
              Now in Early Beta — Join the First Wave
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
              Learn Electronics &amp; Robotics<br className="hidden md:block" />
              <span className="text-slate-400"> Through Hands-On Projects</span>
            </h1>

            <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              Structured curriculum, curated component kits, and an AI tutor — everything you need
              to go from your first circuit to building autonomous robots.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
              <a
                href="#pricing"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-md font-medium hover:bg-slate-800 transition-colors"
              >
                Start Learning Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
              <a
                href="#kits"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('kits')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded-md font-medium hover:bg-slate-50 transition-colors"
              >
                View Component Kits
              </a>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm">
              <a
                href="#why-choose-us"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('why-choose-us')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="text-slate-500 hover:text-slate-800 transition-colors"
              >
                Why choose us?
              </a>
              <span className="text-slate-300">|</span>
              <a
                href="#pricing"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="text-slate-500 hover:text-slate-800 transition-colors"
              >
                View Pricing
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400 justify-center">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-slate-400" /> Beginner friendly
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-slate-400" /> Cancel anytime
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-slate-400" /> No hardware required to start
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-14 px-4 bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">How CircuitPath works</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Three simple steps to go from curious beginner to confident builder.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-0 relative">
            {[
              { step: '01', title: 'Learn', desc: 'Follow structured lessons with step-by-step instructions and clear explanations for every concept.' },
              { step: '02', title: 'Build', desc: 'Apply concepts with hands-on projects using real electronic components from our curated kits.' },
              { step: '03', title: 'Master', desc: 'Track progress, earn achievement badges, and advance through four skill levels.' },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center p-8 border-r border-slate-100 last:border-r-0"
              >
                <div className="text-5xl font-bold text-slate-900 mb-5 select-none">{item.step}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to become a builder
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              From interactive lessons to AI tutoring — we built the complete learning experience.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="p-6 bg-white border border-slate-200 rounded-md hover:border-slate-400 transition-colors group"
              >
                <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center mb-4 group-hover:bg-slate-200 transition-colors">
                  <feature.icon className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Journey */}
      <section className="py-24 px-4 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Your learning journey, mapped out
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Four clear levels. Each one builds on the last. Every milestone ends with a real capstone project.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {LEARNING_MILESTONES.map((milestone, idx) => (
              <motion.div
                key={milestone.level}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="bg-white border border-slate-200 rounded-md p-6 h-full hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-7 h-7 bg-slate-900 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{idx + 1}</span>
                    </div>
                    <span className="text-xs text-slate-400">{milestone.duration}</span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-1">{milestone.level}</h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Capstone: <span className="text-slate-600 font-medium">{milestone.project}</span>
                  </p>
                  <div className="space-y-1.5">
                    {milestone.skills.map((skill) => (
                      <div key={skill} className="flex items-center gap-2 text-xs text-slate-500">
                        <div className="w-1 h-1 bg-slate-300 rounded-full shrink-0" />
                        {skill}
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-400">{milestone.xp}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <a href="#kits" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
              See recommended component kits for each level
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Earn achievements as you grow</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Complete challenges and hit milestones to unlock badges that track your real progress.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {BADGES.map((badge, idx) => (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-md hover:border-slate-400 transition-colors"
              >
                <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center shrink-0">
                  <badge.icon className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{badge.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">{badge.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Kits */}
      <section id="kits" className="py-24 px-4 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                Recommended component kits
              </h2>
              <p className="text-slate-500 max-w-xl">
                Curated kits with everything you need for each learning level. Every component is lesson-tested.
              </p>
            </div>
            <p className="text-xs text-slate-400 shrink-0">Affiliate links support our content</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {AMAZON_KITS.map((kit, idx) => (
              <motion.div
                key={kit.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white border border-slate-200 rounded-md overflow-hidden hover:shadow-sm transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {kit.level} Level
                    </span>
                    <span className="text-lg font-bold text-slate-900">{kit.price}</span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">{kit.name}</h3>
                  <p className="text-sm text-slate-500 mb-5 leading-relaxed">{kit.description}</p>
                  <div className="mb-6">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Kit includes:</p>
                    <ul className="space-y-1.5">
                      {kit.essentials.map((item) => (
                        <li key={item} className="text-sm text-slate-600 flex items-center gap-2">
                          <div className="w-1 h-1 bg-slate-300 rounded-full shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <a
                    href={kit.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    View on Amazon
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              <span className="font-medium">Tip:</span> Start with the Foundation kit and upgrade as you progress.
              Many components are reusable across levels — you won't need to repurchase basics.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison - Why Choose Us */}
      <section id="why-choose-us" className="py-24 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Why learners choose CircuitPath over YouTube
            </h2>
            <p className="text-slate-500">
              Structured learning with accountability beats scattered tutorials every time.
            </p>
          </div>
          
          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {COMPARISON_FEATURES.slice(0, 4).map((feature, idx) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white border border-slate-200 rounded-md p-5 flex items-start gap-4"
              >
                <div className="w-10 h-10 bg-slate-900 rounded-md flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{feature}</h3>
                  <p className="text-sm text-slate-500">Built into every lesson, not an afterthought.</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Remaining Features List */}
          <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
            <div className="grid grid-cols-3 p-4 border-b border-slate-200 bg-slate-50">
              <div className="text-sm font-semibold text-slate-700">Feature</div>
              <div className="text-center text-sm font-bold text-slate-900">CircuitPath ✅</div>
              <div className="text-center text-sm text-slate-400">YouTube ❌</div>
            </div>
            {COMPARISON_FEATURES.map((name, idx) => (
              <div
                key={name}
                className={`grid grid-cols-3 p-4 border-b border-slate-100 last:border-0 ${
                  idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                }`}
              >
                <div className="text-sm text-slate-700 font-medium">{name}</div>
                <div className="flex justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex justify-center">
                  <span className="text-slate-300 text-lg font-light leading-none">—</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beta CTA */}
      <section className="py-24 px-4 bg-white border-y border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700 mb-6">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              Early Beta — Limited Spots
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Be one of our first members</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              CircuitPath is in early beta. Join now, shape the platform, and get rewarded for your honest feedback.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 mb-10">
            {BETA_PERKS.map((perk, idx) => (
              <motion.div
                key={perk.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 bg-slate-50 border border-slate-200 rounded-md text-center"
              >
                <div className="text-3xl mb-4">{perk.emoji}</div>
                <p className="text-sm font-semibold text-slate-900 mb-2">{perk.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{perk.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <a
              href="#pricing"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-md font-medium hover:bg-slate-800 transition-colors"
            >
              Join the Beta Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
            <p className="mt-3 text-xs text-slate-400">No credit card required. Start on the free plan today.</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <PricingSection />

      {/* Final CTA */}
      <section className="py-24 px-4 bg-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Start building with confidence
          </h2>
          <p className="text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Whether you are pursuing a career in robotics or exploring electronics as a hobby,
            CircuitPath gives you the structure and community support to succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#pricing"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-slate-900 rounded-md font-medium hover:bg-slate-100 transition-colors"
            >
              Choose Your Plan
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
            <a
              href="#kits"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('kits')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className="inline-flex items-center justify-center px-6 py-3 bg-transparent text-white border border-slate-700 rounded-md font-medium hover:bg-slate-800 transition-colors"
            >
              Browse Component Kits
            </a>
          </div>
          <p className="mt-5 text-sm text-slate-500">
            Start on the Free plan. No credit card required.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-slate-900 rounded flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-semibold text-slate-900">CircuitPath</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-slate-400">
              <a href="/terms" className="hover:text-slate-700 transition-colors">Terms</a>
              <a href="/privacy" className="hover:text-slate-700 transition-colors">Privacy</a>
              <a href="/cookies" className="hover:text-slate-700 transition-colors">Cookies</a>
              <a href="/acceptable-use" className="hover:text-slate-700 transition-colors">Acceptable Use</a>
              <a href="/disclaimer" className="hover:text-slate-700 transition-colors">Disclaimer</a>
            </div>
            <p className="text-sm text-slate-400">© 2025 CircuitPath</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
