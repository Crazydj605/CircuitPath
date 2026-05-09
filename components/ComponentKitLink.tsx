'use client'

import { ShoppingCart } from 'lucide-react'

const KIT_MAP: Record<string, { label: string; components: string; url: string }> = {
  'blink-led': {
    label: 'LED Blink Kit',
    components: '5mm LED, 220Ω resistor',
    url: 'https://www.amazon.com/s?k=5mm+LED+220+ohm+resistor+arduino+starter',
  },
  'button-input': {
    label: 'Button Input Kit',
    components: 'Tactile button, 10kΩ & 220Ω resistors, LED',
    url: 'https://www.amazon.com/s?k=arduino+pushbutton+10k+resistor+LED+kit',
  },
  'pwm-fade-led': {
    label: 'PWM LED Kit',
    components: '5mm LED, 220Ω resistor',
    url: 'https://www.amazon.com/s?k=5mm+LED+220+ohm+resistor+arduino+PWM',
  },
  'servo-motor': {
    label: 'Servo Motor Kit',
    components: 'SG90 micro servo motor',
    url: 'https://www.amazon.com/s?k=SG90+servo+motor+arduino',
  },
  'analog-sensor': {
    label: 'Potentiometer Kit',
    components: '10kΩ potentiometer trimmer',
    url: 'https://www.amazon.com/s?k=10k+potentiometer+trimmer+arduino+kit',
  },
  'serial-monitor': {
    label: 'Arduino Starter Kit',
    components: 'Arduino UNO + USB cable',
    url: 'https://www.amazon.com/s?k=Arduino+UNO+starter+kit+USB+cable',
  },
}

export default function ComponentKitLink({ slug }: { slug: string }) {
  const kit = KIT_MAP[slug]
  if (!kit) return null

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border border-amber-200 rounded-md text-sm">
      <div className="flex items-center gap-2.5 min-w-0">
        <ShoppingCart className="w-4 h-4 text-amber-600 shrink-0" />
        <div className="min-w-0">
          <span className="font-medium text-amber-900">Parts needed: </span>
          <span className="text-amber-700 truncate">{kit.components}</span>
        </div>
      </div>
      <a
        href={kit.url}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 ml-3 px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded hover:bg-amber-600 transition-colors whitespace-nowrap"
      >
        Buy this kit →
      </a>
    </div>
  )
}
