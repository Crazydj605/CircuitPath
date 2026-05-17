'use client'

import { ShoppingCart } from 'lucide-react'
import AffiliateLink from './AffiliateLink'

// Direct product URLs (Amazon /dp/ASIN format) — these carry the
// affiliate tag reliably. ASINs picked from long-running bestsellers.
// If any go out of stock, swap to a current bestseller and keep the
// `?tag=circuitpath-20` query string intact.
const AFF_TAG = 'circuitpath-20'
const productUrl = (asin: string) =>
  `https://www.amazon.com/dp/${asin}?tag=${AFF_TAG}`
const searchUrl = (query: string) =>
  `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AFF_TAG}`

const KIT_MAP: Record<string, { label: string; components: string; url: string }> = {
  'blink-led': {
    label: 'LED Blink Kit',
    components: '5mm LED, 220Ω resistor',
    // EDGELEC 100pcs 5mm LED assorted — long-running bestseller
    url: productUrl('B077XD7MJV'),
  },
  'button-input': {
    label: 'Button Input Kit',
    components: 'Tactile button, 10kΩ & 220Ω resistors, LED',
    url: searchUrl('arduino pushbutton 10k resistor LED kit'),
  },
  'pwm-fade-led': {
    label: 'PWM LED Kit',
    components: '5mm LED, 220Ω resistor',
    url: productUrl('B077XD7MJV'),
  },
  'servo-motor': {
    label: 'Servo Motor Kit',
    components: 'SG90 micro servo motor (4-pack)',
    // MIUZEI / TIANKONGRC SG90 4-pack — popular stable listing
    url: searchUrl('SG90 servo motor arduino 4 pack'),
  },
  'analog-sensor': {
    label: 'Potentiometer Kit',
    components: '10kΩ potentiometer trimmer',
    url: searchUrl('10k potentiometer trimmer arduino kit'),
  },
  'serial-monitor': {
    label: 'Arduino Starter Kit',
    components: 'Arduino UNO + USB cable',
    // ELEGOO UNO R3 Starter Kit — top-selling Arduino starter kit for years
    url: productUrl('B01D8KOZF4'),
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
      <AffiliateLink
        href={kit.url}
        product={`kit:${slug}`}
        className="shrink-0 ml-3 px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded hover:bg-amber-600 transition-colors whitespace-nowrap"
      >
        Buy this kit →
      </AffiliateLink>
    </div>
  )
}
