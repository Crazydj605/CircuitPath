'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Zap, Menu, X, User, LogOut, Settings } from 'lucide-react'
import Link from 'next/link'
import { supabase, signOut } from '@/lib/supabase'
import AuthModal from './AuthModal'
import Tutorial from './Tutorial'
import { getRank } from '@/lib/xp'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [xp, setXp] = useState<number | null>(null)

  const publicLinks = [
    { label: 'Features', href: '/#features', tourId: undefined },
    { label: 'Pricing', href: '/#pricing', tourId: undefined },
  ]

  const appLinks = [
    { label: 'Dashboard', href: '/dashboard', tourId: 'nav-dashboard' },
    { label: 'Learn', href: '/learn', tourId: 'nav-learn' },
    { label: 'Paths', href: '/paths', tourId: undefined },
    { label: 'Components', href: '/components', tourId: undefined },
    { label: 'Code', href: '/code', tourId: 'nav-code' },
    { label: 'Community', href: '/community', tourId: 'nav-community' },
    { label: 'Certificates', href: '/certificates', tourId: undefined },
    { label: 'Tutoring', href: '/tutoring', tourId: undefined },
    { label: 'Pricing', href: '/pricing', tourId: undefined },
  ]

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase.from('profiles').select('xp').eq('id', session.user.id).maybeSingle()
          .then(({ data }) => setXp(data?.xp ?? 0))
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase.from('profiles').select('xp').eq('id', session.user.id).maybeSingle()
          .then(({ data }) => setXp(data?.xp ?? 0))
      } else {
        setXp(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    setIsMenuOpen(false)
    router.push('/')
  }

  const navLinks = user ? appLinks : publicLinks

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <a href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-slate-900 rounded flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-semibold text-slate-900">CircuitPath</span>
            </a>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-7">
              {navLinks.map((link) => {
                const isActive = link.href.startsWith('/#')
                  ? false
                  : pathname === link.href || pathname.startsWith(link.href + '/')
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    data-tour={link.tourId}
                    className={`text-sm transition-colors ${isActive ? 'text-slate-900 font-medium' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    {link.label}
                  </a>
                )
              })}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-2">
                  {xp !== null && (() => {
                    const rank = getRank(xp)
                    return (
                      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded text-xs font-semibold text-amber-700">
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span className={rank.color}>{rank.name}</span>
                        <span className="text-amber-500">·</span>
                        <span>{xp} XP</span>
                      </div>
                    )
                  })()}
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-sm text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {user.email?.split('@')[0]}
                  </div>
                  <Link
                    href="/settings"
                    className="p-2 hover:bg-slate-100 rounded transition-colors text-slate-500 hover:text-slate-900"
                    title="Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="p-2 hover:bg-slate-100 rounded transition-colors text-slate-500 hover:text-slate-900"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  Get Started
                </button>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 hover:bg-slate-100 rounded transition-colors"
              >
                {isMenuOpen
                  ? <X className="w-5 h-5 text-slate-700" />
                  : <Menu className="w-5 h-5 text-slate-700" />
                }
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden px-4 pb-4 pt-2 border-t border-slate-200 bg-white">
            {navLinks.map((link) => {
              const isActive = link.href.startsWith('/#')
                ? false
                : pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <a
                  key={link.label}
                  href={link.href}
                  data-tour={link.tourId}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-3 text-sm border-b border-slate-100 last:border-0 transition-colors ${isActive ? 'text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {link.label}
                </a>
              )
            })}
            {user ? (
              <>
                <p className="py-3 text-sm text-slate-400 border-b border-slate-100">{user.email}</p>
                <Link
                  href="/settings"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-3 text-sm text-slate-600 hover:text-slate-900 border-b border-slate-100"
                >
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left py-3 text-sm text-red-500 hover:text-red-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => { setIsMenuOpen(false); setIsAuthOpen(true) }}
                className="block w-full text-left py-3 text-sm font-medium text-slate-900"
              >
                Get Started
              </button>
            )}
          </div>
        )}
      </nav>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Tutorial lives in Navbar so it appears on every authenticated page */}
      {user && <Tutorial />}
    </>
  )
}
