'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

export type Pin = {
  label: string
  x: number // 0–100 (percentage from left)
  y: number // 0–100 (percentage from top)
  type: 'digital' | 'analog' | 'pwm' | 'power' | 'ground' | 'serial' | 'i2c' | 'spi' | 'special'
  description: string
}

const TYPE_STYLES: Record<Pin['type'], { dot: string; chip: string; label: string }> = {
  digital: { dot: 'bg-slate-500',  chip: 'bg-slate-100 text-slate-700',  label: 'Digital' },
  analog:  { dot: 'bg-orange-500', chip: 'bg-orange-100 text-orange-700', label: 'Analog' },
  pwm:     { dot: 'bg-violet-500', chip: 'bg-violet-100 text-violet-700', label: 'PWM' },
  power:   { dot: 'bg-red-500',    chip: 'bg-red-100 text-red-700',       label: 'Power' },
  ground:  { dot: 'bg-slate-900',  chip: 'bg-slate-900 text-white',       label: 'Ground' },
  serial:  { dot: 'bg-green-500',  chip: 'bg-green-100 text-green-700',   label: 'Serial' },
  i2c:     { dot: 'bg-teal-500',   chip: 'bg-teal-100 text-teal-700',     label: 'I²C' },
  spi:     { dot: 'bg-indigo-500', chip: 'bg-indigo-100 text-indigo-700', label: 'SPI' },
  special: { dot: 'bg-amber-500',  chip: 'bg-amber-100 text-amber-700',   label: 'Special' },
}

export default function Pinout({ pins, boardName }: { pins: Pin[]; boardName: string }) {
  const [selected, setSelected] = useState<Pin | null>(null)
  const types = Array.from(new Set(pins.map((p) => p.type)))

  return (
    <div>
      <p className="text-sm text-slate-500 mb-3">
        Tap any pin to learn what it does. Color matches pin type.
      </p>

      {/* Legend */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {types.map((t) => {
          const s = TYPE_STYLES[t]
          return (
            <span key={t} className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${s.chip}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              {s.label}
            </span>
          )
        })}
      </div>

      {/* Board canvas — stylized rectangle with pin dots positioned over it */}
      <div className="relative w-full max-w-3xl mx-auto" style={{ aspectRatio: '16 / 10' }}>
        {/* Board body */}
        <div className="absolute inset-[8%] bg-gradient-to-br from-teal-700 to-teal-900 rounded-md shadow-xl">
          {/* USB port */}
          <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[8%] h-[28%] bg-slate-300 rounded-sm shadow-inner" />
          {/* Power jack */}
          <div className="absolute left-0 bottom-[8%] w-[7%] h-[18%] bg-slate-900 rounded-sm shadow-inner" />
          {/* MCU chip */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[26%] h-[26%] bg-slate-950 rounded-sm flex items-center justify-center">
            <span className="text-[8px] sm:text-[10px] font-mono text-slate-400 truncate px-1">
              {boardName}
            </span>
          </div>
          {/* Branding text */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] sm:text-[10px] font-mono text-white/30 uppercase tracking-widest">
            CircuitPath
          </div>
        </div>

        {/* Pin dots */}
        {pins.map((pin, i) => {
          const s = TYPE_STYLES[pin.type]
          const isSelected = selected?.label === pin.label
          return (
            <button
              key={`${pin.label}-${i}`}
              onClick={() => setSelected(isSelected ? null : pin)}
              aria-label={`${pin.label} — ${s.label}`}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform hover:scale-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-700 ${s.dot} ${
                isSelected ? 'ring-4 ring-white scale-150 z-10' : 'ring-1 ring-white/60'
              }`}
              style={{
                left: `${pin.x}%`,
                top: `${pin.y}%`,
                width: 12,
                height: 12,
              }}
            />
          )
        })}
      </div>

      {/* Selected pin detail */}
      {selected && (
        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-md p-4 max-w-2xl mx-auto">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h4 className="text-base font-bold text-slate-900 font-mono">{selected.label}</h4>
              <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${TYPE_STYLES[selected.type].chip}`}>
                {TYPE_STYLES[selected.type].label}
              </span>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-slate-400 hover:text-slate-700 p-1 -m-1"
              aria-label="Close pin detail"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{selected.description}</p>
        </div>
      )}

      {!selected && (
        <p className="mt-6 text-xs text-slate-400 text-center italic">
          {pins.length} pins available — click any colored dot above.
        </p>
      )}
    </div>
  )
}
