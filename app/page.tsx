'use client'

import { motion } from 'framer-motion'
import { 
  Zap, ArrowRight, CheckCircle2, BookOpen, MessageSquare, 
  Target, Users, Award, Play, Quote, Trophy, TrendingUp, 
  ExternalLink, ShoppingCart, Cpu, Lightbulb, Layers, ChevronRight
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import PricingSection from '@/components/PricingSection'
import AiTutor from '@/components/AiTutor'

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Structured Curriculum',
    description: 'Progressive learning path from basic circuits to advanced robotics systems.',
  },
  {
    icon: Target,
    title: 'Project-Based Learning',
    description: 'Build 50+ real projects with step-by-step guidance and troubleshooting support.',
  },
  {
    icon: MessageSquare,
    title: 'Expert Support',
    description: 'Get help from AI tutors and community mentors when you need clarification.',
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

const TESTIMONIALS = [
  {
    quote: "CircuitPath's structured approach took me from complete beginner to building autonomous robots in 6 months. The progression feels natural and each project builds on the last.",
    author: "Sarah Chen",
    role: "Software Engineer",
    company: "Microsoft",
  },
  {
    quote: "The community challenges kept me accountable. Seeing others share their builds motivated me to push through difficult concepts. Worth every penny.",
    author: "Marcus Johnson",
    role: "Electrical Engineering Student",
    company: "MIT",
  },
  {
    quote: "I tried learning from scattered YouTube tutorials for a year with little progress. CircuitPath gave me the structure and component recommendations I needed.",
    author: "Elena Rodriguez",
    role: "Robotics Technician",
    company: "Tesla",
  },
]

const STATS = [
  { value: "50K+", label: "Active Learners" },
  { value: "500+", label: "Lessons & Projects" },
  { value: "98%", label: "Completion Rate" },
  { value: "4.9", label: "Learner Rating" },
]

const LEARNING_MILESTONES = [
  {
    level: "Foundation",
    duration: "Weeks 1-4",
    skills: ["Circuit basics", "Ohm's Law", "Component identification", "Breadboarding"],
    project: "LED Light Show",
    xp: "500 XP"
  },
  {
    level: "Circuit Design",
    duration: "Weeks 5-8",
    skills: ["Resistor networks", "Capacitors", "Switches & logic", "Power management"],
    project: "Digital Dice",
    xp: "1,200 XP"
  },
  {
    level: "Programming",
    duration: "Weeks 9-12",
    skills: ["Arduino basics", "C++ fundamentals", "Sensor integration", "Serial communication"],
    project: "Temperature Monitor",
    xp: "2,500 XP"
  },
  {
    level: "Automation",
    duration: "Weeks 13-16",
    skills: ["Motor control", "PID loops", "Wireless comms", "System integration"],
    project: "Line Following Robot",
    xp: "5,000 XP"
  },
]

const BADGES = [
  { name: "First Circuit", description: "Complete your first working circuit", icon: Lightbulb, color: "amber" },
  { name: "7-Day Streak", description: "Learn for 7 consecutive days", icon: TrendingUp, color: "green" },
  { name: "Project Master", description: "Complete 10 hands-on projects", icon: Trophy, color: "purple" },
  { name: "Community Helper", description: "Answer 5 peer questions", icon: Users, color: "blue" },
  { name: "Debug Expert", description: "Troubleshoot and fix 3 broken circuits", icon: Cpu, color: "red" },
  { name: "Level 50", description: "Reach 50,000 XP total", icon: Layers, color: "cyan" },
]

const AMAZON_KITS = [
  {
    name: "Beginner Electronics Kit",
    description: "Breadboard, resistors, LEDs, wires, and basic components for Foundation level",
    price: "$29.99",
    link: "https://amazon.com",
    level: "Foundation",
    essentials: ["Breadboard", "Resistors (220Ω-10kΩ)", "LEDs (5 colors)", "Jumper wires", "9V battery clip"]
  },
  {
    name: "Arduino Starter Kit",
    description: "Arduino Uno, sensors, motors, and components for Programming level",
    price: "$89.99",
    link: "https://amazon.com",
    level: "Programming",
    essentials: ["Arduino Uno R3", "USB cable", "Temperature sensor", "Servo motor", "LCD display"]
  },
  {
    name: "Advanced Robotics Kit",
    description: "Motors, motor drivers, chassis, and components for Automation level",
    price: "$149.99",
    link: "https://amazon.com",
    level: "Automation",
    essentials: ["Robot chassis", "DC motors (2)", "Motor driver", "IR sensors (5)", "Wheels & caster"]
  },
]

const COMPARISON_FEATURES = [
  { name: "Structured learning path", circuitpath: true, youtube: false },
  { name: "Component kit recommendations", circuitpath: true, youtube: false },
  { name: "Progress milestones & tracking", circuitpath: true, youtube: false },
  { name: "Achievement badges & rewards", circuitpath: true, youtube: false },
  { name: "Community challenges & leaderboards", circuitpath: true, youtube: false },
  { name: "Verified skill certificates", circuitpath: true, youtube: false },
  { name: "AI troubleshooting support", circuitpath: true, youtube: false },
  { name: "Peer project feedback", circuitpath: true, youtube: false },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
              Learn Electronics & Robotics Through{' '}
              <span className="text-slate-600">Hands-On Projects</span>
            </h1>

            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Structured curriculum, curated component kits, and a supportive community of builders.
              From your first circuit to autonomous robots.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a
                href="#pricing"
                className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded font-medium hover:bg-slate-800 transition-colors"
              >
                Start Learning
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
              <a
                href="#kits"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded font-medium hover:bg-slate-50 transition-colors"
              >
                View Component Kits
              </a>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-500 justify-center">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-400" />
                <span>Beginner friendly lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-400" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-400" />
                <span>No hardware required</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 border-y border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Learn', desc: 'Follow structured lessons with video and interactive content' },
              { step: '02', title: 'Build', desc: 'Apply concepts with hands-on projects using real components' },
              { step: '03', title: 'Master', desc: 'Track progress, earn certificates, and advance your skills' },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-slate-300 mb-3">{item.step}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to become a robotics engineer
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              From interactive lessons to AI tutoring, we have built the complete learning experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="p-6 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 transition-colors"
              >
                <div className="w-12 h-12 bg-slate-200 rounded flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Journey Section */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Your learning journey, mapped out
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Progress through structured milestones with clear goals, hands-on projects, and measurable skill development.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {LEARNING_MILESTONES.map((milestone, idx) => (
              <motion.div
                key={milestone.level}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative"
              >
                {idx < LEARNING_MILESTONES.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-[calc(100%+12px)] w-[calc(100%-24px)] h-px bg-slate-300" />
                )}
                
                <div className="bg-white border border-slate-200 rounded p-6 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-slate-500 font-medium">{milestone.duration}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{milestone.level}</h3>
                  
                  <div className="mb-4">
                    <p className="text-sm text-slate-500 mb-2">Capstone Project:</p>
                    <p className="text-sm text-slate-900 font-medium">{milestone.project}</p>
                  </div>
                  
                  <div className="space-y-2">
                    {milestone.skills.map((skill) => (
                      <div key={skill} className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <a href="#kits" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
              See recommended component kits for each level
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Recommended Kits Section */}
      <section id="kits" className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Recommended component kits
              </h2>
              <p className="text-slate-500 max-w-2xl">
                Curated kits with everything you need for each learning level.
                Purchase confidently knowing each component is lesson-tested.
              </p>
            </div>
            <p className="text-sm text-slate-400">
              Affiliate links support our content
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {AMAZON_KITS.map((kit, idx) => (
              <motion.div
                key={kit.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white border border-slate-200 rounded overflow-hidden hover:shadow-sm transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-slate-500 font-medium">{kit.level} Level</span>
                    <span className="text-lg font-bold text-slate-900">{kit.price}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{kit.name}</h3>
                  <p className="text-sm text-slate-500 mb-4">{kit.description}</p>
                  
                  <div className="mb-6">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Kit includes:</p>
                    <ul className="space-y-1">
                      {kit.essentials.map((item) => (
                        <li key={item} className="text-sm text-slate-600 flex items-center gap-2">
                          <div className="w-1 h-1 bg-slate-400 rounded-full" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <a
                    href={kit.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full gap-2 px-4 py-3 bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    View on Amazon
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-900">Pro tip:</span> Start with the Foundation kit and upgrade as you progress.
              Many components are reusable across levels, so you will not need to repurchase basics.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Why learners choose CircuitPath over YouTube
            </h2>
            <p className="text-slate-500">
              Structured learning with accountability and community support beats scattered tutorials.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded overflow-hidden">
            <div className="grid grid-cols-3 gap-4 p-4 border-b border-slate-200 bg-slate-50">
              <div className="text-sm text-slate-500 font-medium">Feature</div>
              <div className="text-center text-sm text-slate-900 font-medium">CircuitPath</div>
              <div className="text-center text-sm text-slate-500">YouTube</div>
            </div>
            
            {COMPARISON_FEATURES.map((item, idx) => (
              <div 
                key={item.name}
                className="grid grid-cols-3 gap-4 p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
              >
                <div className="text-slate-700 text-sm">{item.name}</div>
                <div className="flex justify-center">
                  <CheckCircle2 className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex justify-center">
                  <span className="text-slate-400 text-sm">—</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <PricingSection />

      {/* CTA Section */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Start building with confidence
            </h2>
            <p className="text-slate-500 mb-8 max-w-2xl mx-auto">
              Whether you are pursuing a career in robotics or exploring electronics as a hobby,
              CircuitPath provides the structured path and community support you need to succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#pricing"
                className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded font-medium hover:bg-slate-800 transition-colors"
              >
                Choose Your Plan
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
              <a
                href="#kits"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded font-medium hover:bg-slate-50 transition-colors"
              >
                Browse Component Kits
              </a>
            </div>
            <p className="mt-4 text-sm text-slate-400">
              Start on the Free plan and upgrade when you want more guided depth.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-slate-600" />
              <span className="text-xl font-bold text-slate-900">CircuitPath</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
              <a href="/terms" className="hover:text-slate-800">Terms</a>
              <a href="/privacy" className="hover:text-slate-800">Privacy</a>
              <a href="/cookies" className="hover:text-slate-800">Cookies</a>
              <a href="/acceptable-use" className="hover:text-slate-800">Acceptable Use</a>
              <a href="/disclaimer" className="hover:text-slate-800">Disclaimer</a>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Tutor Widget */}
      <AiTutor />
    </main>
  )
}
