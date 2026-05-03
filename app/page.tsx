'use client'

import { motion } from 'framer-motion'
import { Zap, Play, Users, Award, ArrowRight, CheckCircle2, BookOpen, Wrench, Cpu } from 'lucide-react'
import Navbar from '@/components/Navbar'
import PricingSection from '@/components/PricingSection'
import CircuitSimulator from '@/components/CircuitSimulator'
import AiTutor from '@/components/AiTutor'
import LessonCard from '@/components/LessonCard'

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Interactive Lessons',
    description: 'Learn robotics through hands-on, interactive lessons with real-time feedback.',
  },
  {
    icon: Wrench,
    title: 'Circuit Simulator',
    description: 'Build and test circuits virtually before touching real components.',
  },
  {
    icon: Cpu,
    title: 'AI Tutor',
    description: 'Get personalized help from Grok AI anytime you are stuck.',
  },
]

const SAMPLE_LESSONS = [
  {
    id: '1',
    title: 'Introduction to Circuits',
    description: 'Learn the basics of electrical circuits and how current flows.',
    difficulty: 'beginner' as const,
    duration_minutes: 15,
    xp_reward: 50,
    required_tier: 'free' as const,
    category: 'Basics',
  },
  {
    id: '2',
    title: 'LED & Resistor Basics',
    description: 'Build your first working circuit with an LED and resistor.',
    difficulty: 'beginner' as const,
    duration_minutes: 20,
    xp_reward: 75,
    required_tier: 'free' as const,
    category: 'Components',
  },
  {
    id: '3',
    title: 'Switches & Control',
    description: 'Learn how switches control the flow of electricity.',
    difficulty: 'intermediate' as const,
    duration_minutes: 25,
    xp_reward: 100,
    required_tier: 'pro' as const,
    category: 'Control',
  },
]

const YOUTUBE_COMPARISON = [
  { feature: 'Interactive circuit building', circuitpath: true, youtube: false },
  { feature: 'AI tutor available 24/7', circuitpath: true, youtube: false },
  { feature: 'Structured learning path', circuitpath: true, youtube: false },
  { feature: 'Progress tracking & gamification', circuitpath: true, youtube: false },
  { feature: 'Hands-on projects with feedback', circuitpath: true, youtube: false },
  { feature: 'Certificate of completion', circuitpath: true, youtube: false },
  { feature: 'Free content', circuitpath: 'Limited', youtube: true },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-circuit-dark">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-circuit-accent/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-circuit-purple/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-circuit-accent/10 border border-circuit-accent/30 rounded-full text-circuit-accent text-sm font-medium mb-6"
              >
                <span className="w-2 h-2 bg-circuit-accent rounded-full animate-pulse" />
                New: AI-powered circuit tutoring
              </motion.div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                Master Robotics{' '}
                <span className="bg-gradient-to-r from-circuit-accent to-circuit-purple bg-clip-text text-transparent">
                  Through Play
                </span>
              </h1>

              <p className="text-xl text-gray-400 mb-8 max-w-lg">
                Learn electronics and robotics with interactive lessons, 
                AI tutoring, and hands-on circuit building. Better than YouTube tutorials.
              </p>

              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-circuit-accent to-circuit-purple rounded-2xl font-semibold text-white shadow-lg shadow-circuit-accent/30"
                >
                  <Play className="w-5 h-5" />
                  Start Free Trial
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  <Zap className="w-5 h-5" />
                  See Demo
                </motion.button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mt-12">
                <div>
                  <div className="text-3xl font-bold text-white">50+</div>
                  <div className="text-sm text-gray-500">Interactive Lessons</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">10K+</div>
                  <div className="text-sm text-gray-500">Students Learning</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">4.9</div>
                  <div className="text-sm text-gray-500">User Rating</div>
                </div>
              </div>
            </motion.div>

            {/* Hero Visual - Circuit Simulator Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-circuit-accent/20 to-circuit-purple/20 rounded-3xl blur-2xl" />
                <CircuitSimulator
                  initialComponents={[
                    { id: '1', type: 'battery', x: 50, y: 150, rotation: 0 },
                    { id: '2', type: 'switch', x: 200, y: 50, rotation: 0 },
                    { id: '3', type: 'resistor', x: 350, y: 150, rotation: 0 },
                    { id: '4', type: 'led', x: 200, y: 250, rotation: 0 },
                  ]}
                  initialConnections={[
                    { from: '1', to: '2', from_port: 'out', to_port: 'in' },
                    { from: '2', to: '3', from_port: 'out', to_port: 'in' },
                    { from: '3', to: '4', from_port: 'out', to_port: 'in' },
                  ]}
                  goal="Build a simple LED circuit with a switch!"
                  allowEdit={false}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-circuit-success/10 border border-circuit-success/30 rounded-full text-circuit-success text-sm font-medium mb-4">
              Why Choose CircuitPath
            </span>
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need to Learn Robotics
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Interactive lessons, hands-on projects, and AI-powered tutoring all in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 bg-circuit-panel border border-white/10 rounded-3xl hover:border-circuit-accent/30 transition-colors"
              >
                <div className="w-14 h-14 bg-circuit-accent/20 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-circuit-accent" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Lessons Section */}
      <section id="lessons" className="py-24 px-4 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="inline-block px-4 py-2 bg-circuit-purple/10 border border-circuit-purple/30 rounded-full text-circuit-purple text-sm font-medium mb-4">
                Sample Lessons
              </span>
              <h2 className="text-4xl font-bold text-white">Start Learning Today</h2>
            </div>
            <a
              href="#pricing"
              className="hidden sm:flex items-center gap-2 text-circuit-accent hover:underline font-medium"
            >
              View all lessons <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {SAMPLE_LESSONS.map((lesson, idx) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson as any}
                userLevel={1}
                onClick={() => {}}
              />
            ))}
          </div>
        </div>
      </section>

      {/* YouTube Comparison */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Better Than YouTube Tutorials
            </h2>
            <p className="text-xl text-gray-400">
              See how CircuitPath compares to watching random videos
            </p>
          </div>

          <div className="bg-circuit-panel rounded-3xl border border-white/10 overflow-hidden">
            <div className="grid grid-cols-3 gap-4 p-6 border-b border-white/10 bg-white/5">
              <div className="font-semibold text-white">Feature</div>
              <div className="text-center font-semibold text-circuit-accent">CircuitPath</div>
              <div className="text-center font-semibold text-gray-400">YouTube</div>
            </div>

            {YOUTUBE_COMPARISON.map((item, idx) => (
              <motion.div
                key={item.feature}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="grid grid-cols-3 gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <div className="text-gray-300">{item.feature}</div>
                <div className="flex justify-center">
                  {item.circuitpath === true ? (
                    <CheckCircle2 className="w-6 h-6 text-circuit-success" />
                  ) : (
                    <span className="text-circuit-accent font-medium">{item.circuitpath}</span>
                  )}
                </div>
                <div className="flex justify-center">
                  {item.youtube === true ? (
                    <CheckCircle2 className="w-6 h-6 text-circuit-success" />
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <PricingSection />

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 bg-gradient-to-r from-circuit-accent/20 to-circuit-purple/20 rounded-3xl border border-circuit-accent/30"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Build Your First Circuit?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of learners mastering robotics with CircuitPath
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-circuit-dark rounded-2xl font-semibold shadow-lg"
            >
              Get Started for Free
            </motion.button>
            <p className="mt-4 text-sm text-gray-400">
              No credit card required. 14-day free trial.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-circuit-accent to-circuit-purple rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">CircuitPath</span>
              </div>
              <p className="text-gray-400 text-sm">
                Master robotics through interactive learning and AI-powered tutoring.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Lessons</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Simulator</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI Tutor</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © 2026 CircuitPath. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Tutor Widget */}
      <AiTutor
        lessonContext="User is browsing the CircuitPath homepage"
      />
    </main>
  )
}
