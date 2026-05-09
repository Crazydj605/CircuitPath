'use client'

import { useState } from 'react'
import { ExternalLink, Play, Lock, Zap } from 'lucide-react'
import Link from 'next/link'

// Wokwi public starter project IDs for each lesson
// These are pre-built public projects users can fork
const WOKWI_PROJECTS: Record<string, { projectId: string; description: string }> = {
  'blink-led': {
    projectId: '305686823844102656',
    description: 'Blink an LED on pin 13 — the classic first Arduino program',
  },
  'button-input': {
    projectId: '297985826293498378',
    description: 'Read a pushbutton and light an LED when pressed',
  },
  'pwm-fade-led': {
    projectId: '305687799523803648',
    description: 'Fade an LED in and out using PWM analogWrite',
  },
  'servo-motor': {
    projectId: '305688044469890560',
    description: 'Control a servo motor sweeping from 0° to 180°',
  },
  'analog-sensor': {
    projectId: '297985826293498379',
    description: 'Read a potentiometer value and print to serial',
  },
  'serial-monitor': {
    projectId: '305688158888829440',
    description: 'Send and receive data through the Serial Monitor',
  },
}

export default function WokwiSimulator({
  slug,
  userTier,
}: {
  slug: string
  userTier: string
}) {
  const [launched, setLaunched] = useState(false)
  const isPro = userTier === 'pro' || userTier === 'premium' || userTier === 'max'
  const project = WOKWI_PROJECTS[slug]

  if (!project) return null

  return (
    <div className="bg-white border border-slate-200 rounded-md overflow-hidden mb-4">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center shrink-0">
            <Play className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Wokwi Simulator</h3>
            <p className="text-xs text-slate-400">Test your circuit in the browser — no hardware needed</p>
          </div>
        </div>
        {isPro && (
          <a
            href={`https://wokwi.com/projects/${project.projectId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open full
          </a>
        )}
      </div>

      {!isPro ? (
        <div className="p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-50 rounded-md flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900">Pro feature</p>
            <p className="text-xs text-slate-500 mt-0.5">Upgrade to run the simulator for every lesson in your browser.</p>
          </div>
          <Link
            href="/pricing"
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 transition-colors"
          >
            <Zap className="w-3 h-3" /> Go Pro
          </Link>
        </div>
      ) : !launched ? (
        <div className="p-5 text-center space-y-3">
          <p className="text-sm text-slate-600">{project.description}</p>
          <button
            onClick={() => setLaunched(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-md transition-colors"
          >
            <Play className="w-4 h-4" /> Launch Simulator
          </button>
          <p className="text-xs text-slate-400">Loads the pre-wired circuit for this lesson</p>
        </div>
      ) : (
        <div className="aspect-video">
          <iframe
            src={`https://wokwi.com/projects/${project.projectId}`}
            className="w-full h-full border-0"
            title="Wokwi Simulator"
            allow="serial"
          />
        </div>
      )}
    </div>
  )
}
