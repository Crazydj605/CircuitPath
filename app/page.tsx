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
    <main className="min-h-screen bg-[#0d0d10]">
      <Navbar />

      {/* Hero Section - Engineering Professional */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-800/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded mb-6">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                <span className="text-sm text-slate-400">50,000+ engineers and hobbyists</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
                Learn Electronics & Robotics Through{' '}
                <span className="text-slate-300">Hands-On Projects</span>
              </h1>

              <p className="text-lg text-slate-400 mb-8 max-w-lg leading-relaxed">
                Structured curriculum, curated component kits, and a supportive community of builders. 
                From your first circuit to autonomous robots.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a
                  href="#pricing"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-slate-900 rounded font-medium hover:bg-slate-200 transition-colors"
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
                <a
                  href="#kits"
                  className="inline-flex items-center justify-center px-6 py-3 bg-slate-800 text-slate-200 border border-slate-700 rounded font-medium hover:bg-slate-700 transition-colors"
                >
                  View Component Kits
                </a>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-400" />
                  <span>14-day free trial</span>
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-semibold">Learning Progress</h3>
                  <span className="text-sm text-slate-400">Level 3 of 16</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-white">Foundation Circuits</span>
                        <span className="text-sm text-gray-500">100%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-green-400 rounded-full" style={{ width: '100%' }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-600/20 rounded-lg flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-white">Circuit Design</span>
                        <span className="text-sm text-gray-500">65%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-400 rounded-full" style={{ width: '65%' }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-sm">03</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-400">Arduino Programming</span>
                        <span className="text-sm text-gray-500">Locked</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Current Streak</p>
                      <p className="text-xl font-bold text-white">12 days</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Next Badge</p>
                      <p className="text-sm text-white">Circuit Master</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">XP Earned</p>
                      <p className="text-xl font-bold text-slate-400">2,840</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything you need to become a robotics engineer
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              From interactive lessons to AI tutoring, we've built the complete learning experience.
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
                className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-colors group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-slate-700/30 to-slate-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Loved by learners worldwide
            </h2>
            <p className="text-gray-400">
              See what our community has to say about their experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl"
              >
                <Quote className="w-8 h-8 text-slate-500/30 mb-4" />
                <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.author[0]}
                  </div>
                  <div>
                    <div className="text-white font-medium">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.role} · {testimonial.company}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Journey Section */}
      <section className="py-24 px-4 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Your learning journey, mapped out
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
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
                {/* Connector line */}
                {idx < LEARNING_MILESTONES.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-[calc(100%+12px)] w-[calc(100%-24px)] h-px bg-gradient-to-r from-slate-500/30 to-transparent -z-10 pointer-events-none" />
                )}
                
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-slate-400 font-medium">{milestone.duration}</span>
                    <span className="text-sm text-gray-500">{milestone.xp}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">{milestone.level}</h3>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">Capstone Project:</p>
                    <p className="text-sm text-white">{milestone.project}</p>
                  </div>
                  
                  <div className="space-y-2">
                    {milestone.skills.map((skill) => (
                      <div key={skill} className="flex items-center gap-2 text-sm text-gray-400">
                        <div className="w-1.5 h-1.5 bg-slate-600/50 rounded-full" />
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <a href="#kits" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors">
              See recommended component kits for each level
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Badges & Gamification Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Earn achievements as you grow
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Track your progress, maintain learning streaks, and unlock badges that demonstrate your expertise.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {BADGES.map((badge, idx) => {
              const colorClasses = {
                amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
                green: "bg-green-500/10 border-slate-500/30 text-green-400",
                purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
                blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
                red: "bg-red-500/10 border-red-500/20 text-red-400",
                cyan: "bg-slate-600/10 border-slate-500/20 text-slate-400",
              }
              const colorClass = colorClasses[badge.color as keyof typeof colorClasses]
              
              return (
                <motion.div
                  key={badge.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-4 rounded-xl border text-center ${colorClass}`}
                >
                  <badge.icon className="w-8 h-8 mx-auto mb-3" />
                  <h4 className="font-medium text-sm mb-1">{badge.name}</h4>
                  <p className="text-xs opacity-80">{badge.description}</p>
                </motion.div>
              )
            })}
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
              <div className="text-3xl font-bold text-white mb-1">1,247</div>
              <div className="text-sm text-gray-500">Active streaks this week</div>
            </div>
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
              <div className="text-3xl font-bold text-white mb-1">156</div>
              <div className="text-sm text-gray-500">Community challenges completed</div>
            </div>
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
              <div className="text-3xl font-bold text-white mb-1">2,341</div>
              <div className="text-sm text-gray-500">Projects shared this month</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Kits Section */}
      <section id="kits" className="py-24 px-4 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Recommended component kits
              </h2>
              <p className="text-gray-400 max-w-2xl">
                Curated kits with everything you need for each learning level. 
                Purchase confidently knowing each component is lesson-tested.
              </p>
            </div>
            <p className="text-sm text-gray-500">
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
                className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-slate-400 font-medium">{kit.level} Level</span>
                    <span className="text-lg font-bold text-white">{kit.price}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">{kit.name}</h3>
                  <p className="text-sm text-gray-400 mb-4">{kit.description}</p>
                  
                  <div className="mb-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Kit includes:</p>
                    <ul className="space-y-1">
                      {kit.essentials.map((item) => (
                        <li key={item} className="text-sm text-gray-400 flex items-center gap-2">
                          <div className="w-1 h-1 bg-slate-600/50 rounded-full" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <a
                    href={kit.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-medium hover:bg-white/10 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    View on Amazon
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-white/[0.02] border border-white/5 rounded-xl flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-400">
              <span className="text-white font-medium">Pro tip:</span> Start with the Foundation kit and upgrade as you progress. 
              Many components are reusable across levels, so you won't need to repurchase basics.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why learners choose CircuitPath over YouTube
            </h2>
            <p className="text-gray-400">
              Structured learning with accountability and community support beats scattered tutorials.
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 gap-4 p-4 border-b border-white/5 bg-white/[0.02]">
              <div className="text-sm text-gray-500">Feature</div>
              <div className="text-center text-sm text-white font-medium">CircuitPath</div>
              <div className="text-center text-sm text-gray-500">YouTube</div>
            </div>
            
            {COMPARISON_FEATURES.map((item, idx) => (
              <div 
                key={item.name}
                className="grid grid-cols-3 gap-4 p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.01] transition-colors"
              >
                <div className="text-gray-300 text-sm">{item.name}</div>
                <div className="flex justify-center">
                  <CheckCircle2 className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex justify-center">
                  <span className="text-gray-600 text-sm">—</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <PricingSection />

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center p-8 md:p-12 bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/5 rounded-3xl">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Start building with confidence
              </h2>
              <p className="text-gray-400 mb-6">
                Whether you're pursuing a career in robotics or exploring electronics as a hobby, 
                CircuitPath provides the structured path and community support you need to succeed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#pricing"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#0a0a0f] rounded-full font-medium hover:bg-gray-100 transition-colors"
                >
                  Begin Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
                <a
                  href="#kits"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white/5 text-white border border-white/10 rounded-full font-medium hover:bg-white/10 transition-colors"
                >
                  Browse Component Kits
                </a>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Free for 14 days. No credit card required to start.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <div className="w-10 h-10 bg-slate-600/10 rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Structured Curriculum</h4>
                  <p className="text-sm text-gray-400">Progressive lessons from basics to advanced concepts</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Achievement System</h4>
                  <p className="text-sm text-gray-400">Earn badges and certificates as you master skills</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Builder Community</h4>
                  <p className="text-sm text-gray-400">Connect with peers, share projects, get feedback</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0">
                  <ShoppingCart className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Curated Kits</h4>
                  <p className="text-sm text-gray-400">Lesson-tested components with direct Amazon links</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-slate-400" />
              <span className="text-xl font-bold text-white">CircuitPath</span>
            </div>
            <p className="text-gray-500 text-sm">© 2024 CircuitPath. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* AI Tutor Widget */}
      <AiTutor />
    </main>
  )
}
