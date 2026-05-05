'use client'

import React, { useState, useEffect } from 'react'
import { Zap, Menu, X, User, LogOut } from 'lucide-react'
import { supabase, signOut } from '@/lib/supabase'
import AuthModal from './AuthModal'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  const publicNavLinks = [
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Features', href: '/#features' },
  ]

  const appNavLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Learn', href: '/learn' },
    { label: 'Community', href: '/community' },
  ]

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d0d10]/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-slate-400" />
              <span className="text-lg font-semibold text-white">CircuitPath</span>
            </a>

            <div className="hidden md:flex items-center gap-8">
              {(user ? appNavLinks : publicNavLinks).map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-white">
                      {user.email?.split('@')[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="px-5 py-2 bg-white text-[#0a0a0f] rounded text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  Get Started
                </button>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 hover:bg-white/10 rounded-lg"
              >
                {isMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden px-4 py-4 border-t border-white/5 bg-[#0a0a0f]/95">
            {(user ? appNavLinks : publicNavLinks).map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block py-3 text-gray-400 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            {user && (
              <button
                onClick={() => {
                  handleSignOut()
                  setIsMenuOpen(false)
                }}
                className="block w-full text-left py-3 text-red-400"
              >
                Sign Out
              </button>
            )}
          </div>
        )}
      </nav>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  )
}
