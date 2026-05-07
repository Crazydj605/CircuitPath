'use client'

import { useEffect, useState, useCallback } from 'react'
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
const PAD = 10

export default function Tutorial() {
  const pathname = usePathname()
  const [stepIdx, setStepIdx] = useState<number | null>(null)
  const [visible, setVisible] = useState(false)
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    if (localStorage.getItem(DONE_KEY)) return
    const saved = localStorage.getItem(STEP_KEY)
    if (saved !== null) {
      setStepIdx(parseInt(saved, 10))
      setVisible(true)
    }
  }, [])

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
    window.addEventListener('scroll', update, { passive: true })
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update)
    }
  }, [currentStep])

  const advance = useCallback(() => {
    const next = (stepIdx ?? 0) + 1
    if (next >= STEPS.length) { skip(); return }
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

  const BG = 'rgba(0,0,0,0.78)'
  const hasSpot = !!rect

  // Spotlight coordinates
  const sTop    = rect ? rect.top    - PAD : 0
  const sBottom = rect ? rect.bottom + PAD : 0
  const sLeft   = rect ? rect.left   - PAD : 0
  const sRight  = rect ? rect.right  + PAD : 0
  const sW      = rect ? rect.width  + PAD * 2 : 0
  const sH      = rect ? rect.height + PAD * 2 : 0

  return (
    <>
      {hasSpot ? (
        <>
          {/* Top strip */}
          <div
            className="fixed inset-x-0 top-0 z-[9000]"
            style={{ height: Math.max(0, sTop), background: BG, pointerEvents: 'all' }}
          />
          {/* Bottom strip */}
          <div
            className="fixed inset-x-0 bottom-0 z-[9000]"
            style={{ top: sBottom, background: BG, pointerEvents: 'all' }}
          />
          {/* Left strip */}
          <div
            className="fixed left-0 z-[9000]"
            style={{ top: sTop, height: sH, width: Math.max(0, sLeft), background: BG, pointerEvents: 'all' }}
          />
          {/* Right strip */}
          <div
            className="fixed right-0 z-[9000]"
            style={{ top: sTop, height: sH, left: sRight, background: BG, pointerEvents: 'all' }}
          />
          {/* White glow ring around target — purely visual, no pointer events */}
          <div
            className="fixed z-[9001] rounded-md pointer-events-none"
            style={{
              top: sTop,
              left: sLeft,
              width: sW,
              height: sH,
              outline: '2px solid white',
              outlineOffset: '2px',
              boxShadow: '0 0 16px 4px rgba(255,255,255,0.25)',
            }}
          />
        </>
      ) : (
        /* Full-screen block when no spotlight target */
        <div
          className="fixed inset-0 z-[9000]"
          style={{ background: BG, pointerEvents: 'all' }}
        />
      )}

      {/* Tutorial panel — always bottom-left, always above overlay */}
      <div
        className="fixed bottom-6 left-6 z-[9002] w-80 bg-white border border-slate-200 rounded-md shadow-2xl overflow-hidden"
        style={{ pointerEvents: 'all' }}
      >
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
            <X className="w-3 h-3" /> Skip
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm font-semibold text-slate-900 mb-2">{currentStep.title}</p>
          <p className="text-sm text-slate-500 leading-relaxed mb-4">{currentStep.desc}</p>

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

          {!currentStep.isWelcome && !currentStep.isDone && currentStep.waitForPath && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <ArrowRight className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">Click the highlighted link in the navigation above to continue.</p>
            </div>
          )}

          {!currentStep.isWelcome && !currentStep.isDone && !currentStep.waitForPath && (
            <button
              onClick={advance}
              className="w-full flex items-center justify-center gap-2 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
            >
              Next <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

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
