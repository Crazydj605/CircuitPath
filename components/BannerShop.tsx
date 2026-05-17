'use client'

import { useState, useEffect } from 'react'
import { Palette, Check, Lock } from 'lucide-react'

export const BANNER_OPTIONS = [
  { id: 'default', name: 'Default', color: 'bg-slate-900', cost: 0 },
  { id: 'green', name: 'Forest', color: 'bg-green-900', cost: 100 },
  { id: 'blue', name: 'Ocean', color: 'bg-blue-900', cost: 200 },
  { id: 'purple', name: 'Cosmic', color: 'bg-purple-900', cost: 300 },
  { id: 'amber', name: 'Gold', color: 'bg-amber-900', cost: 500 },
  { id: 'red', name: 'Crimson', color: 'bg-red-900', cost: 750 },
  { id: 'rainbow', name: 'Rainbow', color: 'bg-gradient-to-r from-red-900 via-purple-900 to-blue-900', cost: 1000 },
]

const STORAGE_SELECTED = 'cp_banner_selected'
const STORAGE_UNLOCKED = 'cp_banner_unlocked'

export function getSavedBanner(): string {
  if (typeof window === 'undefined') return 'default'
  return localStorage.getItem(STORAGE_SELECTED) || 'default'
}

export default function BannerShop({ xp, onPurchase }: { xp: number; onPurchase: (cost: number) => void }) {
  const [selected, setSelected] = useState('default')
  const [unlocked, setUnlocked] = useState<string[]>(['default'])

  useEffect(() => {
    const savedSelected = localStorage.getItem(STORAGE_SELECTED) || 'default'
    const savedUnlocked = JSON.parse(localStorage.getItem(STORAGE_UNLOCKED) || '["default"]')
    setSelected(savedSelected)
    setUnlocked(savedUnlocked)
  }, [])

  const purchase = (banner: typeof BANNER_OPTIONS[0]) => {
    if (unlocked.includes(banner.id)) {
      setSelected(banner.id)
      localStorage.setItem(STORAGE_SELECTED, banner.id)
      window.dispatchEvent(new CustomEvent('cp:banner-change', { detail: banner.id }))
      return
    }
    if (xp >= banner.cost) {
      onPurchase(banner.cost)
      const newUnlocked = [...unlocked, banner.id]
      setUnlocked(newUnlocked)
      setSelected(banner.id)
      localStorage.setItem(STORAGE_SELECTED, banner.id)
      localStorage.setItem(STORAGE_UNLOCKED, JSON.stringify(newUnlocked))
      window.dispatchEvent(new CustomEvent('cp:banner-change', { detail: banner.id }))
    }
  }

  const preview = BANNER_OPTIONS.find(b => b.id === selected)?.color || 'bg-slate-900'

  return (
    <div className="bg-white border border-slate-200 rounded-md p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-violet-500" />
          <h3 className="font-semibold text-slate-900">Banner Shop</h3>
        </div>
        <span className="text-xs text-slate-500">Spend XP to unlock</span>
      </div>
      <div className={`h-8 rounded-md mb-4 ${preview} transition-all duration-300`} />
      <div className="grid grid-cols-2 gap-2">
        {BANNER_OPTIONS.map(banner => {
          const isUnlocked = unlocked.includes(banner.id)
          const canAfford = xp >= banner.cost
          const isSelected = selected === banner.id
          return (
            <button
              key={banner.id}
              onClick={() => purchase(banner)}
              disabled={!isUnlocked && !canAfford}
              className={`relative p-3 rounded-md border text-left transition-all ${
                isSelected
                  ? 'border-violet-500 ring-1 ring-violet-500'
                  : 'border-slate-200 hover:border-slate-300'
              } ${!isUnlocked && !canAfford ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className={`h-5 rounded ${banner.color} mb-2`} />
              <p className="text-xs font-medium text-slate-700">{banner.name}</p>
              <p className="text-xs text-slate-400">
                {isUnlocked ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <Check className="w-3 h-3" /> {isSelected ? 'Active' : 'Owned'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3" /> {banner.cost} XP
                  </span>
                )}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
