'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Award, Zap, Bell } from 'lucide-react'

interface Toast {
  id: string
  type: 'badge' | 'xp' | 'lesson'
  title: string
  message: string
}

export default function ToastNotifications() {
  const [toasts, setToasts] = useState<Toast[]>([])

  // Demo: show a toast on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      addToast({
        type: 'badge',
        title: 'Badge Unlocked!',
        message: 'You earned the "First Steps" badge'
      })
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7)
    setToasts(prev => [...prev, { ...toast, id }])
    setTimeout(() => removeToast(id), 5000)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const icons = {
    badge: Award,
    xp: Zap,
    lesson: Bell,
  }

  const colors = {
    badge: 'bg-amber-500',
    xp: 'bg-violet-500',
    lesson: 'bg-blue-500',
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map(toast => {
          const Icon = icons[toast.type]
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className="bg-white border border-slate-200 rounded-md shadow-lg p-4 min-w-[280px]"
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${colors[toast.type]}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
                  <p className="text-xs text-slate-500">{toast.message}</p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
