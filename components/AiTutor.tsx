'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, Sparkles, User, Loader2, BookOpen, Lightbulb, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'
import { chatWithGrok, type GrokMessage } from '@/lib/grok'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AiTutorProps {
  lessonContext?: string
  circuitContext?: string
  isOpen?: boolean
  onClose?: () => void
}

const QUICK_ACTIONS = [
  { icon: BookOpen, label: 'Explain concept', prompt: 'Can you explain how this circuit works?' },
  { icon: Lightbulb, label: 'Get hint', prompt: 'I need a hint for this lesson' },
  { icon: Wrench, label: 'Debug help', prompt: 'My circuit is not working, help me debug' },
]

export default function AiTutor({ lessonContext, circuitContext, isOpen = true, onClose }: AiTutorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your CircuitPath AI tutor. I'm here to help you learn robotics and electronics. What would you like to know?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(!isOpen)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const grokMessages: GrokMessage[] = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }))
      
      grokMessages.push({ role: 'user', content: text })

      let context = ''
      if (lessonContext) context += `Lesson context: ${lessonContext}\n`
      if (circuitContext) context += `Current circuit state: ${circuitContext}\n`

      const response = await chatWithGrok(grokMessages, context || undefined)

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment!",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (prompt: string) => {
    handleSend(prompt)
  }

  if (isMinimized) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-circuit-accent to-circuit-purple rounded-full flex items-center justify-center shadow-lg shadow-circuit-accent/30 z-50"
      >
        <Bot className="w-7 h-7 text-white" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-circuit-success rounded-full flex items-center justify-center text-xs font-bold">
          AI
        </span>
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="fixed bottom-6 right-6 w-96 bg-circuit-panel border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-circuit-accent/20 to-circuit-purple/20 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-circuit-accent to-circuit-purple rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">CircuitPath AI</h3>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-circuit-success rounded-full animate-pulse" />
              <span className="text-xs text-gray-400">Online</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <span className="sr-only">Minimize</span>
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 p-3 border-b border-white/10 overflow-x-auto">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={() => handleQuickAction(action.prompt)}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-300 whitespace-nowrap transition-colors"
          >
            <action.icon className="w-4 h-4 text-circuit-accent" />
            {action.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'flex-row-reverse' : ''
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                  message.role === 'user' ? 'bg-circuit-purple/20' : 'bg-circuit-accent/20'
                )}
              >
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-circuit-purple" />
                ) : (
                  <Sparkles className="w-4 h-4 text-circuit-accent" />
                )}
              </div>
              <div
                className={cn(
                  'max-w-[80%] p-3 rounded-xl text-sm',
                  message.role === 'user'
                    ? 'bg-circuit-purple/20 text-white'
                    : 'bg-white/5 text-gray-200'
                )}
              >
                {message.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-circuit-accent/20 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-circuit-accent animate-spin" />
            </div>
            <div className="p-3 rounded-xl bg-white/5">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about robotics, circuits..."
            className="flex-1 px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-circuit-accent/50 transition-colors"
          />
          <motion.button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-3 bg-gradient-to-r from-circuit-accent to-circuit-purple rounded-xl text-white disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
