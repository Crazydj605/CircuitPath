'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Menu, X, Crown, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import GamificationBar from './GamificationBar'
import AuthModal from './AuthModal'
import type { UserStats } from '@/types'

interface NavbarProps {
  user?: {
    email: string
    name: string
    subscription_tier: 'free' | 'pro' | 'premium'
  } | null
  stats?: UserStats
  onAuthClick?: () => void
}

export default function Navbar({ user, stats, onAuthClick }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  const navLinks = [
    { label: 'Learn', href: '#lessons' },
    { label: 'Circuits', href: '#circuits' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Community', href: '#community' },
  ]

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-circuit-dark/80 backdrop-blur-xl border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-circuit-accent to-circuit-purple rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">
                CircuitPath
              </span>
            </a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  {/* Stats Bar */}
                  {stats && (
                    <div className="hidden lg:block">
                      <GamificationBar stats={stats} compact />
                    </div>
                  )}

                  {/* Upgrade Button */}
                  {user.subscription_tier === 'free' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-circuit-accent to-circuit-purple rounded-xl text-white text-sm font-medium"
                    >
                      <Crown className="w-4 h-4" />
                      Upgrade
                    </motion.button>
                  )}

                  {/* User Menu */}
                  <button className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-xl transition-colors">
                    <div className="w-8 h-8 bg-circuit-accent/20 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-circuit-accent" />
                    </div>
                  </button>
                </>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsAuthOpen(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-circuit-accent to-circuit-purple rounded-xl text-white font-medium"
                >
                  Get Started
                </motion.button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <Menu className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{ height: isMenuOpen ? 'auto' : 0, opacity: isMenuOpen ? 1 : 0 }}
          className="md:hidden overflow-hidden border-t border-white/5"
        >
          <div className="px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block text-gray-400 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
            
            {!user && (
              <button
                onClick={() => {
                  setIsMenuOpen(false)
                  setIsAuthOpen(true)
                }}
                className="w-full py-3 bg-gradient-to-r from-circuit-accent to-circuit-purple rounded-xl text-white font-medium"
              >
                Get Started
              </button>
            )}
          </div>
        </motion.div>
      </motion.nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </>
  )
}
