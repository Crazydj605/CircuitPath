'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { X, ArrowRight, Compass } from 'lucide-react'

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to CircuitPath!',
    desc: "Want a quick 1-minute tour so you know where everything is?",
    selector: null,
    waitForPath: null,
    isWelcome: true,
    isDone: false,
  },
  {
    id: 'nav-learn',
    title: 'Step 1 of 4 — Lesson Library',
    desc: "Click 'Learn' in the navigation bar at the top to open your lesson library.",
    selector: '[data-tour="nav-learn"]',
    waitForPath: '/learn',
    isWelcome: false,
    isDone: false,
  },
  {
    id: 'on-learn',
    title: 'Step 2 of 4 — Your Lessons',
    desc: "Each card is a lesson. Work through them at your own pace — they build on each other. Let's keep exploring.",
    selector: null,
    waitForPath: null,
    isWelcome: false,
    isDone: false,
  },
  {
    id: 'nav-community',
    title: 'Step 3 of 4 — Community',
    desc: "Click 'Community' in the top navigation to see how other learners are doing.",
    selector: '[data-tour="nav-community"]',
    waitForPath: '/community',
    isWelcome: false,
    isDone: false,
  },
  {
    id: 'on-community',
    title: 'Step 4 of 4 — Connect',
    desc: "Share your progress, ask questions, and join weekly challenges with other builders.",
    selector: null,
    waitForPath: null,
    isWelcome: false,
    isDone: false,
  },
  {
    id: 'done',
    title: "You're all set!",
    desc: "That's the full tour. Head to your lesson library and start your first lesson. Good luck!",
    selector: null,
    waitForPath: null,
    isWelcome: false,
    isDone: true,
  },
]

const STEP_KEY = 'cp_tour_step'
const DONE_KEY = 'cp_tour_done'

export default function Tutorial() {
  const pathname = usePathname()
  const [stepIdx, setStepIdx] = useState<number | null>(null)
  const [visible, setVisible] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const frameRef = useRef<number | null>(null)

  // Load on mount
  useEffect(() => {
    if (localStorage.getItem(DONE_KEY)) return
    const saved = localStorage.getItem(STEP_KEY)
    if (saved !== null) {
      setStepIdx(parseInt(saved, 10))
      setVisible(true)
    }
  }, [])

  // Listen for start event (dispatched from Dashboard for first-time users)
  useEffect(() => {
    const onStart = () => {
      localStorage.removeItem(DONE_KEY)
      localStorage.setItem(STEP_KEY, '0')
      setStepIdx(0)
      setVisible(true)
    }
    window.addEventListener('cp:start-tour', onStart)
    return () => window.removeEventListener('cp:start-tour', onStart)
  }, [])

  const currentStep = stepIdx !== null ? STEPS[stepIdx] ?? null : null

  // Auto-advance when user navigates to the expected path
  useEffect(() => {
    if (!currentStep?.waitForPath) return
    if (pathname === currentStep.waitForPath) {
      const next = (stepIdx ?? 0) + 1
      if (next < STEPS.length) {
        setStepIdx(next)
        localStorage.setItem(STEP_KEY, String(next))
      }
    }
  }, [pathname])

  // Track the spotlight target position
  useEffect(() => {
    if (!currentStep?.selector) {
      setRect(null)
      return
    }
    const update = () => {
      const el = document.querySelector(currentStep.selector!)
      setRect(el ? el.getBoundingClientRect() : null)
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update)
    }
  }, [currentStep])

  const advance = useCallback(() => {
    const next = (stepIdx ?? 0) + 1
    if (next >= STEPS.length) {
      skip()
      return
    }
    setStepIdx(next)
    localStorage.setItem(STEP_KEY, String(next))
  }, [stepIdx])

  const skip = useCallback(() => {
    setVisible(false)
    setStepIdx(null)
    localStorage.setItem(DONE_KEY, 'true')
    localStorage.removeItem(STEP_KEY)
  }, [])

  if (!visible || !currentStep) return null

  const hasSpot = !!rect

  return (
    <>
      {/* Full-screen dim */}
      <div
        className="fixed inset-0 z-[9000] pointer-events-none transition-opacity"
        style={{ background: 'rgba(0,0,0,0.6)' }}
      />

      {/* Spotlight cut-out — transparent box with giant box-shadow that dims surroundings */}
      {hasSpot && rect && (
        <div
          className="fixed z-[9001] pointer-events-none rounded-lg transition-all duration-300"
          style={{
            top: rect.top - 10,
            left: rect.left - 14,
            width: rect.width + 28,
            height: rect.height + 20,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
            outline: '2px solid rgba(255,255,255,0.35)',
            outlineOffset: '2px',
          }}
        />
      )}

      {/* Tutorial box — always bottom-left */}
      <div
        className="fixed bottom-6 left-6 z-[9002] w-80 bg-white border border-slate-200 rounded-md shadow-2xl overflow-hidden"
        style={{ pointerEvents: 'all' }}
      >
        {/* Header bar — skip is ALWAYS here */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">
              {currentStep.isWelcome ? 'Tour' : currentStep.isDone ? 'Complete' : currentStep.title.split('—')[0].trim()}
            </span>
          </div>
          <button
            onClick={skip}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors px-2 py-1 rounded hover:bg-slate-200"
          >
            <X className="w-3 h-3" />
            Skip
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm font-semibold text-slate-900 mb-2">{currentStep.title}</p>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">{currentStep.desc}</p>

          {/* Welcome step */}
          {currentStep.isWelcome && (
            <div className="flex gap-2">
              <button
                onClick={advance}
                className="flex-1 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
              >
                Start Tour
              </button>
              <button
                onClick={skip}
                className="flex-1 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-200 transition-colors"
              >
                Skip
              </button>
            </div>
          )}

          {/* Step waiting for user navigation */}
          {!currentStep.isWelcome && !currentStep.isDone && currentStep.waitForPath && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <ArrowRight className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">Click the highlighted link in the navigation above to continue.</p>
            </div>
          )}

          {/* Informational step — just a Next button */}
          {!currentStep.isWelcome && !currentStep.isDone && !currentStep.waitForPath && (
            <button
              onClick={advance}
              className="w-full flex items-center justify-center gap-2 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
            >
              Next <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Done step */}
          {currentStep.isDone && (
            <a
              href="/learn"
              onClick={skip}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
            >
              Go to lessons <ArrowRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </>
  )
}
