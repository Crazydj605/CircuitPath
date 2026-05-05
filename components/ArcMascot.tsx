'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, MessageSquare, Bot } from 'lucide-react'

interface ArcMascotProps {
  emotion?: 'wave' | 'confused' | 'neutral' | 'celebrate'
  message?: string
  onClose?: () => void
  showOnce?: boolean
  storageKey?: string
}

const ARC_IMAGES = {
  wave: '/arc/arc-wave.png',
  confused: '/arc/arc-confused.png',
  neutral: '/arc/arc-neutral.png',
  celebrate: '/arc/arc-neutral.png',
}

const DEFAULT_MESSAGES = {
  wave: "Welcome to CircuitPath. I'm Arc, your guide through robotics and electronics. I'll help you navigate the curriculum and answer questions along the way.",
  confused: "Need clarification? I can explain concepts, troubleshoot circuits, or recommend resources. How can I assist?",
  neutral: "Ready to continue? Your next lesson covers fundamental circuit principles.",
  celebrate: "Progress noted. You've completed another milestone in your learning path.",
}

export default function ArcMascot({
  emotion = 'wave',
  message,
  onClose,
  showOnce = true,
  storageKey = 'arc-welcome-shown'
}: ArcMascotProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isDismissed, setIsDismissed] = useState(false)

  const onboardingSteps = [
    {
      emotion: 'wave' as const,
      message: "Welcome to CircuitPath. I'm Arc, your guide through robotics and electronics. I'll help you navigate the curriculum and answer questions.",
    },
    {
      emotion: 'neutral' as const,
      message: "The Foundation level covers circuit fundamentals: Ohm's Law, component identification, and breadboarding. Each lesson builds practical skills.",
    },
    {
      emotion: 'confused' as const,
      message: "Need help? I can explain concepts, review your circuit designs, or point you to relevant documentation. Just ask when you need assistance.",
    },
  ]

  useEffect(() => {
    if (showOnce) {
      const hasSeenWelcome = localStorage.getItem(storageKey)
      if (!hasSeenWelcome) {
        setIsVisible(true)
      }
    } else {
      setIsVisible(true)
    }
  }, [showOnce, storageKey])

  const handleClose = () => {
    setIsDismissed(true)
    setTimeout(() => {
      setIsVisible(false)
      if (showOnce) {
        localStorage.setItem(storageKey, 'true')
      }
      onClose?.()
    }, 300)
  }

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleClose()
    }
  }

  const currentEmotion = showOnce ? onboardingSteps[currentStep].emotion : emotion
  const currentMessage = message || (showOnce ? onboardingSteps[currentStep].message : DEFAULT_MESSAGES[emotion])
  const isLastStep = currentStep === onboardingSteps.length - 1

  if (!isVisible) return null

  return (
    <AnimatePresence>
      {!isDismissed && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm"
        >
          <div className="bg-[#12121a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl shadow-slate-500/5">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Arc</span>
              </div>
              <button 
                onClick={handleClose}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex gap-4">
              {/* Arc Image */}
              <div className="shrink-0">
                <div className="w-16 h-16 relative bg-slate-800/50 rounded-lg flex items-center justify-center border border-slate-700">
                  <img 
                    src={ARC_IMAGES[currentEmotion]} 
                    alt="Arc"
                    className="w-14 h-14 object-contain"
                    onError={(e) => {
                      // Hide broken image
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                  {/* Fallback robot icon - hidden by default, shown if image fails */}
                  <div id="arc-fallback" className="hidden absolute inset-0 flex items-center justify-center">
                    <Bot className="w-10 h-10 text-slate-500" />
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentStep}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-sm text-gray-300 leading-relaxed"
                  >
                    {currentMessage}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4">
              {showOnce && (
                <div className="flex gap-1">
                  {onboardingSteps.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        idx === currentStep ? 'bg-slate-400' : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              )}
              
              <button
                onClick={handleNext}
                className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                {isLastStep ? 'Get Started' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
