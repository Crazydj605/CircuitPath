'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot, User, Sparkles, Lock } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

type QuotaState = {
  tier: 'guest' | 'free' | 'pro' | 'max'
  used: number
  limit: number
  remaining: number
  resetAt?: string
}

export default function AiTutor() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hi! I'm your AI tutor. Ask me anything about circuits, electronics, or robotics and I'll help you out.",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [quota, setQuota] = useState<QuotaState | null>(null)
  const [blocked, setBlocked] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  // Fetch current quota state on open
  useEffect(() => {
    if (!isOpen) return
    let cancelled = false
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const headers: Record<string, string> = {}
      if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`
      try {
        const res = await fetch('/api/chat', { headers })
        const data = await res.json()
        if (!cancelled) {
          setQuota(data)
          setBlocked(data.tier !== 'max' && data.remaining === 0)
        }
      } catch {}
    }
    load()
    return () => {
      cancelled = true
    }
  }, [isOpen])

  const handleSend = async () => {
    if (!input.trim() || isLoading || blocked) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: userMessage.content }),
      })

      const data = await res.json()

      if (res.status === 401) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content:
              "You need to be signed in to chat with the AI tutor. Sign up free and come back — I'll be here.",
          },
        ])
        return
      }

      if (res.status === 429) {
        setBlocked(true)
        setQuota({ tier: data.tier, used: data.used, limit: data.limit, remaining: 0, resetAt: data.resetAt })
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.error ?? "You've hit today's limit. Upgrade for more AI tutor messages.",
          },
        ])
        return
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message ?? 'Hmm, I could not generate a reply. Try rephrasing.',
        },
      ])
      if (data.quota) {
        setQuota({
          tier: data.quota.tier,
          used: data.quota.used,
          limit: data.quota.limit,
          remaining: data.quota.remaining,
        })
        if (data.quota.tier !== 'max' && data.quota.remaining === 0) setBlocked(true)
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const showQuotaPill =
    quota && quota.tier !== 'max' && Number.isFinite(quota.limit) && !blocked

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 bg-slate-900 hover:bg-slate-800 text-white rounded-full px-4 py-3 shadow-lg flex items-center gap-2 z-40 text-sm font-medium"
          >
            <Bot className="w-4 h-4" />
            Ask AI Tutor
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-3rem)] bg-white border border-slate-200 rounded-lg shadow-2xl flex flex-col z-40 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-slate-900 rounded flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">AI Tutor</p>
                  {showQuotaPill && (
                    <p className="text-[11px] text-slate-500">
                      {quota!.remaining} of {quota!.limit} left today
                    </p>
                  )}
                  {quota?.tier === 'max' && (
                    <p className="text-[11px] text-violet-600 font-medium">Max · unlimited</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m) => (
                <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-lg text-sm leading-relaxed ${
                      m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {m.content}
                  </div>
                  {m.role === 'user' && (
                    <div className="w-6 h-6 bg-slate-200 rounded flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-slate-100 px-3 py-2 rounded-lg text-sm text-slate-500">
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '120ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '240ms' }} />
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer */}
            {blocked ? (
              <div className="p-4 border-t border-slate-100 bg-amber-50">
                <div className="flex items-start gap-2 mb-2">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700 leading-relaxed">
                    <p className="font-semibold mb-0.5">Daily limit reached</p>
                    <p>You used your {quota?.limit} free AI tutor messages today. Upgrade for more.</p>
                  </div>
                </div>
                <Link
                  href="/pricing"
                  className="block w-full text-center py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  See Pro &amp; Max
                </Link>
              </div>
            ) : (
              <div className="p-3 border-t border-slate-100">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything about circuits…"
                    className="flex-1 text-sm border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:border-slate-400"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2 rounded-md transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
