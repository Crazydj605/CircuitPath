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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-slate-400" />
              <span className="text-lg font-semibold text-slate-900">CircuitPath</span>
            </a>

            <div className="hidden md:flex items-center gap-8">
              {(user ? appNavLinks : publicNavLinks).map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-800">
                      {user.email?.split('@')[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                className="px-5 py-2 bg-slate-900 text-white rounded text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  Get Started
                </button>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
              >
                {isMenuOpen ? <X className="w-5 h-5 text-slate-900" /> : <Menu className="w-5 h-5 text-slate-900" />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden px-4 py-4 border-t border-slate-200 bg-white/95">
            {(user ? appNavLinks : publicNavLinks).map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block py-3 text-slate-500 hover:text-slate-900"
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
