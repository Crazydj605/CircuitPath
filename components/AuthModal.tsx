'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signUp, signIn } from '@/lib/supabase'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (mode === 'signup') {
        await signUp(email, password, name)
      } else {
        await signIn(email, password)
      }
      onSuccess?.()
      onClose()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
    setError('')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-circuit-panel border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-circuit-accent to-circuit-purple rounded-2xl flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {mode === 'signin' ? 'Welcome Back' : 'Start Your Journey'}
            </h2>
            <p className="text-gray-400 text-sm mt-2">
              {mode === 'signin' 
                ? 'Continue your robotics adventure' 
                : 'Join CircuitPath and master robotics'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-circuit-danger/20 border border-circuit-danger/30 rounded-lg text-sm text-circuit-danger"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-circuit-accent/50 transition-colors"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-circuit-accent/50 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-circuit-accent/50 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'w-full py-4 bg-gradient-to-r from-circuit-accent to-circuit-purple rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50',
                'shadow-lg shadow-circuit-accent/20'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Please wait...
                </>
              ) : mode === 'signin' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </motion.button>
          </form>

          {/* Switch Mode */}
          <p className="mt-6 text-center text-sm text-gray-400">
            {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={switchMode}
              className="text-circuit-accent hover:underline font-medium"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-500 uppercase">or continue with</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Social Login */}
          <button
            type="button"
            className="w-full py-3 bg-white/5 border border-white/10 rounded-xl font-medium text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
