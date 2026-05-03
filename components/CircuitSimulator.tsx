'use client'

import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Battery, Lightbulb, ToggleLeft, Zap, Play, RotateCcw, HelpCircle, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CircuitComponent, CircuitConnection } from '@/types'

interface CircuitSimulatorProps {
  initialComponents?: CircuitComponent[]
  initialConnections?: CircuitConnection[]
  goal?: string
  hints?: string[]
  onComplete?: () => void
  onHintRequest?: () => void
  allowEdit?: boolean
}

const COMPONENT_TYPES = {
  battery: { icon: Battery, color: '#ff3366', label: 'Battery' },
  led: { icon: Lightbulb, color: '#00ff88', label: 'LED' },
  switch: { icon: ToggleLeft, color: '#ffaa00', label: 'Switch' },
  resistor: { icon: Zap, color: '#8b5cf6', label: 'Resistor' },
}

export default function CircuitSimulator({
  initialComponents = [],
  initialConnections = [],
  goal = 'Complete the circuit to light up the LED!',
  hints = ['Connect the positive terminal of the battery to the switch'],
  onComplete,
  onHintRequest,
  allowEdit = true,
}: CircuitSimulatorProps) {
  const [components, setComponents] = useState<CircuitComponent[]>(initialComponents)
  const [connections, setConnections] = useState<CircuitConnection[]>(initialConnections)
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationResult, setSimulationResult] = useState<'success' | 'error' | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [currentHint, setCurrentHint] = useState(0)
  const [draggedType, setDraggedType] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleDragStart = (type: string) => {
    setDraggedType(type)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedType || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - 40
    const y = e.clientY - rect.top - 40

    const newComponent: CircuitComponent = {
      id: `comp-${Date.now()}`,
      type: draggedType as any,
      x,
      y,
      rotation: 0,
      is_powered: false,
    }

    setComponents([...components, newComponent])
    setDraggedType(null)
  }, [draggedType, components])

  const handleComponentClick = (id: string) => {
    if (!allowEdit) return
    
    if (selectedComponent === null) {
      setSelectedComponent(id)
    } else if (selectedComponent === id) {
      setSelectedComponent(null)
    } else {
      // Create connection
      const newConnection: CircuitConnection = {
        from: selectedComponent,
        to: id,
        from_port: 'out',
        to_port: 'in',
      }
      setConnections([...connections, newConnection])
      setSelectedComponent(null)
    }
  }

  const runSimulation = () => {
    setIsSimulating(true)
    
    // Simulate circuit validation
    setTimeout(() => {
      const hasBattery = components.some(c => c.type === 'battery')
      const hasLed = components.some(c => c.type === 'led')
      const hasPath = connections.length >= 2

      if (hasBattery && hasLed && hasPath) {
        setSimulationResult('success')
        onComplete?.()
      } else {
        setSimulationResult('error')
      }
      
      setIsSimulating(false)
    }, 1500)
  }

  const reset = () => {
    setComponents(initialComponents)
    setConnections(initialConnections)
    setSimulationResult(null)
    setSelectedComponent(null)
  }

  const requestHint = () => {
    setShowHint(true)
    setCurrentHint((prev) => (prev + 1) % hints.length)
    onHintRequest?.()
  }

  return (
    <div className="bg-circuit-panel rounded-2xl p-6 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Circuit Builder</h3>
          <p className="text-gray-400 text-sm">{goal}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={requestHint}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            title="Get a hint"
          >
            <HelpCircle className="w-5 h-5 text-circuit-warning" />
          </button>
          <button
            onClick={reset}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            title="Reset circuit"
          >
            <RotateCcw className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Hint */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-circuit-warning/10 border border-circuit-warning/30 rounded-lg"
          >
            <p className="text-circuit-warning text-sm">
              <span className="font-semibold">Hint:</span> {hints[currentHint]}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Component Palette */}
      {allowEdit && (
        <div className="flex gap-3 mb-6 p-3 bg-black/20 rounded-xl">
          {Object.entries(COMPONENT_TYPES).map(([type, { icon: Icon, color, label }]) => (
            <motion.div
              key={type}
              draggable
              onDragStart={() => handleDragStart(type)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-1 p-3 bg-white/5 rounded-lg cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors"
            >
              <Icon className="w-6 h-6" style={{ color }} />
              <span className="text-xs text-gray-400">{label}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Circuit Canvas */}
      <div
        ref={canvasRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="relative w-full h-80 bg-gradient-to-b from-black/40 to-black/20 rounded-xl border border-white/5 overflow-hidden"
      >
        {/* Grid */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,212,255,0.3) 1px, transparent 0)`,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {connections.map((conn, idx) => {
            const fromComp = components.find(c => c.id === conn.from)
            const toComp = components.find(c => c.id === conn.to)
            if (!fromComp || !toComp) return null

            return (
              <motion.line
                key={idx}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                x1={fromComp.x + 40}
                y1={fromComp.y + 40}
                x2={toComp.x + 40}
                y2={toComp.y + 40}
                stroke={isSimulating ? '#00ff88' : '#00d4ff'}
                strokeWidth="3"
                strokeLinecap="round"
                className={isSimulating ? 'animate-pulse' : ''}
              />
            )
          })}
        </svg>

        {/* Components */}
        {components.map((component) => {
          const { icon: Icon, color } = COMPONENT_TYPES[component.type as keyof typeof COMPONENT_TYPES] || {}
          const isSelected = selectedComponent === component.id
          const isPowered = isSimulating && component.type === 'led'

          return (
            <motion.div
              key={component.id}
              drag={allowEdit}
              dragMomentum={false}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => handleComponentClick(component.id)}
              className={cn(
                'absolute w-20 h-20 rounded-xl flex items-center justify-center cursor-pointer transition-all',
                isSelected ? 'ring-2 ring-circuit-accent' : 'ring-1 ring-white/10',
                isPowered && 'shadow-lg shadow-circuit-success/50'
              )}
              style={{
                left: component.x,
                top: component.y,
                backgroundColor: isPowered ? 'rgba(0, 255, 136, 0.2)' : 'rgba(18, 18, 26, 0.9)',
                borderColor: isSelected ? '#00d4ff' : 'rgba(255, 255, 255, 0.1)',
                borderWidth: '1px',
                transform: `rotate(${component.rotation}deg)`,
              }}
            >
              {Icon && (
                <Icon
                  className="w-10 h-10"
                  style={{
                    color: isPowered ? '#00ff88' : color,
                    filter: isPowered ? 'drop-shadow(0 0 10px #00ff88)' : 'none',
                  }}
                />
              )}
            </motion.div>
          )
        })}

        {/* Empty State */}
        {components.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500 text-sm">Drag components here to build your circuit</p>
          </div>
        )}
      </div>

      {/* Simulation Controls */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            {connections.length} connections
          </span>
          <span className="text-sm text-gray-400">
            {components.length} components
          </span>
        </div>

        <div className="flex gap-3">
          {simulationResult === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-4 py-2 bg-circuit-success/20 border border-circuit-success/30 rounded-lg"
            >
              <CheckCircle className="w-5 h-5 text-circuit-success" />
              <span className="text-circuit-success font-medium">Circuit Complete!</span>
            </motion.div>
          )}

          {simulationResult === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-4 py-2 bg-circuit-danger/20 border border-circuit-danger/30 rounded-lg"
            >
              <XCircle className="w-5 h-5 text-circuit-danger" />
              <span className="text-circuit-danger font-medium">Circuit Incomplete</span>
            </motion.div>
          )}

          <motion.button
            onClick={runSimulation}
            disabled={isSimulating}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-circuit-accent to-circuit-purple rounded-xl font-semibold text-white disabled:opacity-50"
          >
            <Play className={cn('w-5 h-5', isSimulating && 'animate-pulse')} />
            {isSimulating ? 'Running...' : 'Run Simulation'}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
