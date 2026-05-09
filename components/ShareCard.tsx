'use client'

import { useEffect, useRef } from 'react'
import { Download } from 'lucide-react'

export default function ShareCard({
  lessonTitle,
  steps,
  xp,
}: {
  lessonTitle: string
  steps: number
  xp: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 1200
    const H = 630
    canvas.width = W
    canvas.height = H

    // Background
    const bg = ctx.createLinearGradient(0, 0, W, H)
    bg.addColorStop(0, '#0f172a')
    bg.addColorStop(1, '#1e293b')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    // Amber accent bar
    ctx.fillStyle = '#f59e0b'
    ctx.fillRect(0, 0, W, 6)

    // Subtle grid overlay
    ctx.strokeStyle = 'rgba(255,255,255,0.03)'
    ctx.lineWidth = 1
    for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
    for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

    // Logo
    ctx.fillStyle = '#f59e0b'
    ctx.font = 'bold 30px system-ui, -apple-system, Arial, sans-serif'
    ctx.fillText('⚡ CircuitPath', 80, 82)

    // Main headline
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 76px system-ui, -apple-system, Arial, sans-serif'
    ctx.fillText('Lesson Complete!', 80, 205)

    // Lesson title (with truncation)
    ctx.fillStyle = '#94a3b8'
    ctx.font = '38px system-ui, -apple-system, Arial, sans-serif'
    let title = lessonTitle
    const maxW = 1040
    while (ctx.measureText(title).width > maxW && title.length > 0) {
      title = title.slice(0, -1)
    }
    if (title !== lessonTitle) title += '...'
    ctx.fillText(title, 80, 275)

    // Divider
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(80, 320)
    ctx.lineTo(1120, 320)
    ctx.stroke()

    // Stat box helper
    const drawStat = (x: number, value: string, label: string, valueColor: string) => {
      // Box
      ctx.fillStyle = 'rgba(255,255,255,0.05)'
      ctx.beginPath()
      ctx.rect(x, 350, 240, 130)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Value
      ctx.fillStyle = valueColor
      ctx.font = 'bold 58px system-ui, -apple-system, Arial, sans-serif'
      ctx.fillText(value, x + 20, 430)

      // Label
      ctx.fillStyle = '#64748b'
      ctx.font = '24px system-ui, -apple-system, Arial, sans-serif'
      ctx.fillText(label, x + 20, 464)
    }

    drawStat(80, String(steps), 'Steps Done', '#ffffff')
    drawStat(360, `+${xp} XP`, 'Earned', '#f59e0b')

    // Tag line
    ctx.fillStyle = '#475569'
    ctx.font = '22px system-ui, -apple-system, Arial, sans-serif'
    ctx.fillText('Learn Arduino & Electronics at circuitpath.net', 80, 592)
  }, [lessonTitle, steps, xp])

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.download = 'circuitpath-completion.png'
    a.href = canvas.toDataURL('image/png')
    a.click()
  }

  const shareTwitter = () => {
    const text = `Just completed "${lessonTitle}" on CircuitPath! Earning ${xp} XP building real Arduino circuits 🔌⚡`
    const url = 'https://circuitpath.net'
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    )
  }

  return (
    <div>
      <canvas ref={canvasRef} className="hidden" />
      <p className="text-xs text-slate-400 text-center mb-3">Share your achievement</p>
      <div className="flex gap-3 justify-center flex-wrap">
        <button
          onClick={download}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 transition-colors border border-slate-700"
        >
          <Download className="w-4 h-4" />
          Download card
        </button>
        <button
          onClick={shareTwitter}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-black transition-colors border border-slate-700"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Share on X
        </button>
      </div>
    </div>
  )
}
