'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Battery, Lightbulb, Play, RotateCcw } from 'lucide-react'

interface Component {
  id: string
  type: 'battery' | 'led' | 'resistor' | 'wire'
  x: number
  y: number
  rotation: number
}

export default function CircuitSimulator({ compact = false }) {
  const [components, setComponents] = useState<Component[]>([
    { id: '1', type: 'battery', x: 50, y: 150, rotation: 0 },
    { id: '2', type: 'led', x: 200, y: 150, rotation: 0 },
  ])
  const [isSimulating, setIsSimulating] = useState(false)
  const [ledOn, setLedOn] = useState(false)

  const runSimulation = () => {
    setIsSimulating(true)
    setTimeout(() => {
      setLedOn(true)
      setIsSimulating(false)
    }, 1000)
  }

  const reset = () => {
    setLedOn(false)
    setIsSimulating(false)
  }

  if (compact) {
    return (
      <div className="bg-[#0a0a0f] rounded-2xl p-4 border border-white/10">
        <div className="flex items-center justify-center gap-8 py-8">
          <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center border-2 border-green-500/50">
            <Battery className="w-8 h-8 text-green-400" />
          </div>
          <div className="h-1 w-24 bg-gray-700 rounded" />
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center border-2 transition-all ${ledOn ? 'bg-yellow-500/30 border-yellow-400 shadow-lg shadow-yellow-400/50' : 'bg-gray-800 border-gray-600'}`}>
            <Lightbulb className={`w-8 h-8 ${ledOn ? 'text-yellow-300' : 'text-gray-500'}`} />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={runSimulation}
            className="flex-1 py-2 bg-cyan-400/20 text-cyan-400 rounded-lg font-medium hover:bg-cyan-400/30 transition-colors"
          >
            Run Circuit
          </button>
          <button
            onClick={reset}
            className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#0a0a0f] rounded-2xl p-8 min-h-[300px] relative border border-white/10">
        <svg className="w-full h-[300px]">
          {/* Battery */}
          <g transform="translate(100, 150)">
            <rect x="-30" y="-20" width="60" height="40" fill="#10b981" rx="4" opacity="0.3" />
            <rect x="-20" y="-15" width="40" height="30" fill="#10b981" rx="2" />
            <text x="0" y="5" textAnchor="middle" fill="white" fontSize="12">9V</text>
          </g>

          {/* Wire */}
          <path
            d="M 130 150 L 250 150"
            stroke="#374151"
            strokeWidth="4"
            fill="none"
          />

          {/* LED */}
          <g transform="translate(280, 150)">
            <circle
              r="25"
              fill={ledOn ? '#fbbf24' : '#374151'}
              opacity={ledOn ? '0.3' : '1'}
            />
            <circle
              r="20"
              fill={ledOn ? '#fbbf24' : '#1f2937'}
              stroke={ledOn ? '#fbbf24' : '#374151'}
              strokeWidth="2"
            />
            {ledOn && (
              <>
                <path d="M -10 -5 L -5 -15 M -5 -5 L 0 -15 M 0 -5 L 5 -15" stroke="#fbbf24" strokeWidth="2" />
                <path d="M 5 5 L 10 -5 M 10 5 L 15 -5 M 15 5 L 20 -5" stroke="#fbbf24" strokeWidth="2" />
              </>
            )}
          </g>

          {/* Wire back */}
          <path
            d="M 280 175 L 280 220 L 100 220 L 100 170"
            stroke="#374151"
            strokeWidth="4"
            fill="none"
          />
        </svg>
      </div>

      <div className="flex gap-4">
        <button
          onClick={runSimulation}
          disabled={isSimulating}
          className="flex-1 py-3 bg-cyan-400/20 text-cyan-400 rounded-xl font-medium hover:bg-cyan-400/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          {isSimulating ? 'Running...' : 'Run Simulation'}
        </button>
        <button
          onClick={reset}
          className="px-6 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Reset
        </button>
      </div>

      {ledOn && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-400/10 border border-green-400/30 rounded-xl"
        >
          <p className="text-green-400 font-medium">Circuit Complete! The LED is now powered.</p>
        </motion.div>
      )}
    </div>
  )
}
