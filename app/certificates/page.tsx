'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Award, Download, Check, ChevronRight, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

type CompletedLesson = {
  lesson_id: string
  slug: string
  title: string
  completed_at: string
  certificate: { recipient_name: string; issued_at: string } | null
}

const CERT_PRICE: Record<string, string> = {
  free: '$4.99',
  pro: '$1.99',
  max: 'Free',
}

function CertificateView({ lesson, name, issuedAt }: { lesson: CompletedLesson; name: string; issuedAt: string }) {
  const handlePrint = () => window.print()
  const date = new Date(issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="certificate-wrapper">
      <style>{`
        @media print {
          body > * { display: none !important; }
          .certificate-wrapper { display: block !important; }
          .no-print { display: none !important; }
          .certificate { box-shadow: none !important; }
          .pattern-bg { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        @media screen {
          .certificate-wrapper { padding: 24px; }
        }
        .pattern-dots {
          background-image: radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        .pattern-lines {
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(0,0,0,0.02) 10px,
            rgba(0,0,0,0.02) 20px
          );
        }
        .gold-gradient {
          background: linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 50%, #d6d3d1 100%);
        }
        .corner-decoration {
          position: absolute;
          width: 60px;
          height: 60px;
          border: 2px solid rgba(0,0,0,0.1);
        }
        .corner-tl { top: 20px; left: 20px; border-right: none; border-bottom: none; }
        .corner-tr { top: 20px; right: 20px; border-left: none; border-bottom: none; }
        .corner-bl { bottom: 20px; left: 20px; border-right: none; border-top: none; }
        .corner-br { bottom: 20px; right: 20px; border-left: none; border-top: none; }
      `}</style>
      <div className="certificate relative max-w-2xl mx-auto bg-white rounded-sm overflow-hidden shadow-2xl">
        {/* Pattern background */}
        <div className="pattern-bg absolute inset-0 pattern-dots" />
        <div className="pattern-bg absolute inset-0 pattern-lines opacity-50" />
        
        {/* Gold border accent */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />
        
        {/* Corner decorations */}
        <div className="corner-decoration corner-tl" />
        <div className="corner-decoration corner-tr" />
        <div className="corner-decoration corner-bl" />
        <div className="corner-decoration corner-br" />
        
        {/* Content */}
        <div className="relative z-10 p-14 text-center">
          {/* Logo area */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                <Award className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -inset-2 border-2 border-amber-300 rounded-full opacity-30" />
            </div>
          </div>
          
          {/* Header */}
          <div className="mb-8">
            <p className="text-xs tracking-[0.4em] uppercase text-slate-400 font-medium mb-2">Certificate of Completion</p>
            <h1 className="text-3xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'Georgia, serif' }}>CircuitPath</h1>
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-400" />
              <div className="w-2 h-2 bg-amber-400 rounded-full" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-400" />
            </div>
          </div>
          
          {/* Main text */}
          <div className="mb-8">
            <p className="text-sm text-slate-500 mb-3">This certifies that</p>
            <p className="text-4xl font-bold text-slate-900 mb-3" style={{ fontFamily: 'Georgia, serif' }}>{name}</p>
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-8 bg-slate-300" />
              <p className="text-sm text-slate-500">has successfully completed</p>
              <div className="h-px w-8 bg-slate-300" />
            </div>
            <p className="text-xl font-semibold text-slate-800">{lesson.title}</p>
          </div>
          
          {/* Decorative element */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
              <div className="w-2 h-2 bg-amber-500 rounded-full" />
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
            </div>
            <div className="h-px w-20 bg-slate-200 mx-3" />
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
              <div className="w-2 h-2 bg-amber-500 rounded-full" />
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
            </div>
          </div>
          
          {/* Footer info */}
          <div className="flex items-center justify-center gap-12 text-sm">
            <div className="text-center">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Date Issued</p>
              <p className="font-semibold text-slate-700">{date}</p>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div className="text-center">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Certificate ID</p>
              <p className="font-mono text-xs text-slate-600">CP-{lesson.slug.slice(0, 4).toUpperCase()}-{issuedAt.slice(0, 4)}</p>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div className="text-center">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Issuing Authority</p>
              <p className="font-semibold text-slate-700">CircuitPath</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center gap-3 mt-6 no-print flex-wrap">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-md hover:bg-slate-800 transition-colors shadow-lg"
        >
          <Download className="w-4 h-4" /> Save as PDF (Print → Save as PDF)
        </button>
        <a
          href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(lesson.title)}&organizationName=CircuitPath&issueYear=${new Date(issuedAt).getFullYear()}&issueMonth=${new Date(issuedAt).getMonth() + 1}&certUrl=${encodeURIComponent('https://circuitpath.net/certificates')}&certId=CP-${lesson.slug.slice(0, 4).toUpperCase()}-${issuedAt.slice(0, 4)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0A66C2] text-white text-sm font-semibold rounded-md hover:bg-[#004182] transition-colors shadow-lg"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          Add to LinkedIn
        </a>
      </div>
    </div>
  )
}

function CertificatesPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userToken, setUserToken] = useState<string | null>(null)
  const [tier, setTier] = useState<string>('free')
  const [lessons, setLessons] = useState<CompletedLesson[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<CompletedLesson | null>(null)
  const [nameInput, setNameInput] = useState('')
  const [certData, setCertData] = useState<{ name: string; issuedAt: string } | null>(null)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')
  const [paidSuccess, setPaidSuccess] = useState(false)

  useEffect(() => {
    if (searchParams.get('paid') === '1') {
      setPaidSuccess(true)
      router.replace('/certificates')
    }
  }, [searchParams, router])

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }
      setUserToken(session.access_token)

      const [profileRes, certsRes] = await Promise.all([
        supabase.from('profiles').select('subscription_tier').eq('id', session.user.id).maybeSingle(),
        fetch('/api/certificates', { headers: { Authorization: `Bearer ${session.access_token}` } }),
      ])
      setTier(profileRes.data?.subscription_tier || 'free')
      if (certsRes.ok) {
        const d = await certsRes.json()
        setLessons(d.completed_lessons || [])
      }
      setLoading(false)
    }
    init()
  }, [router])

  const generate = async () => {
    if (!selected || !nameInput.trim() || !userToken) return
    setGenerating(true)
    setGenError('')

    if (tier === 'max') {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lesson_slug: selected.slug, recipient_name: nameInput.trim(), userToken }),
      })
      const d = await res.json()
      if (res.ok) {
        setCertData({ name: d.recipient_name, issuedAt: d.issued_at })
        setLessons(prev => prev.map(l => l.slug === selected.slug ? { ...l, certificate: { recipient_name: d.recipient_name, issued_at: d.issued_at } } : l))
      } else {
        setGenError(d.error || 'Something went wrong')
      }
    } else {
      const res = await fetch('/api/stripe/create-cert-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonSlug: selected.slug, recipientName: nameInput.trim(), userToken }),
      })
      const d = await res.json()
      if (d.url) {
        window.location.href = d.url
      } else {
        setGenError(d.error || 'Something went wrong')
      }
    }
    setGenerating(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
      </div>
    )
  }

  if (certData && selected) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="no-print">
          <Navbar />
          <div className="pt-20 pb-4 max-w-3xl mx-auto px-4">
            <button onClick={() => setCertData(null)} className="text-sm text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1">
              ← Back to certificates
            </button>
          </div>
        </div>
        <CertificateView lesson={selected} name={certData.name} issuedAt={certData.issuedAt} />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="bg-white border-b border-slate-200 px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-7 h-7 text-amber-500" />
              <h1 className="text-2xl font-bold text-slate-900">Certificates</h1>
            </div>
            <p className="text-slate-500 text-sm ml-10">Download proof of completion for your finished lessons.</p>
            <div className="ml-10 mt-3 flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-green-500" /> Max — Free</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-amber-500" /> Pro — $1.99 each</span>
              <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-slate-400" /> Free — $4.99 each</span>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 mt-8">
          {paidSuccess && (
            <div className="mb-5 flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-800">Payment received!</p>
                <p className="text-xs text-green-700 mt-0.5">Your certificate is being issued. Refresh the page in a moment if it doesn't appear below.</p>
              </div>
            </div>
          )}

          {lessons.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Award className="w-12 h-12 mx-auto mb-3 text-slate-200" />
              <p className="text-sm font-medium">No completed lessons yet</p>
              <p className="text-xs mt-1">Complete a lesson to earn your first certificate.</p>
              <Link href="/learn" className="inline-flex items-center gap-1 mt-4 text-sm text-slate-700 font-semibold hover:underline">
                Start learning <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map(lesson => (
                <div key={lesson.slug} className="bg-white border border-slate-200 rounded-md p-5 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${lesson.certificate ? 'bg-amber-100' : 'bg-slate-100'}`}>
                    <Award className={`w-5 h-5 ${lesson.certificate ? 'text-amber-500' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm">{lesson.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Completed {new Date(lesson.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    {lesson.certificate && (
                      <p className="text-xs text-green-600 mt-0.5 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Issued to {lesson.certificate.recipient_name}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {lesson.certificate ? (
                      <button
                        onClick={() => {
                          setSelected(lesson)
                          setCertData({ name: lesson.certificate!.recipient_name, issuedAt: lesson.certificate!.issued_at })
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> View
                      </button>
                    ) : (
                      <button
                        onClick={() => { setSelected(lesson); setCertData(null); setNameInput(''); setGenError('') }}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors"
                      >
                        <Award className="w-3.5 h-3.5" />
                        Get Certificate
                        {tier !== 'max' && <span className="ml-1 text-amber-300">{CERT_PRICE[tier]}</span>}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selected && !certData && (
            <div className="mt-6 bg-white border border-slate-200 rounded-md p-5">
              <h3 className="font-semibold text-slate-900 text-sm mb-1">
                Certificate for: <span className="text-amber-600">{selected.title}</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">This name will appear on your certificate exactly as typed.</p>
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                placeholder="Full name (e.g. Alex Johnson)"
                maxLength={60}
                className="w-full text-sm border border-slate-200 rounded-md px-3 py-2.5 focus:outline-none focus:border-slate-400 mb-3"
              />
              {genError && <p className="text-xs text-red-600 mb-3">{genError}</p>}
              <button
                onClick={generate}
                disabled={!nameInput.trim() || generating}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Award className="w-4 h-4" />
                {generating
                  ? (tier === 'max' ? 'Generating…' : 'Redirecting to payment…')
                  : tier === 'max'
                  ? 'Generate Certificate (Free)'
                  : `Pay ${CERT_PRICE[tier]} & Get Certificate`
                }
              </button>
              {tier !== 'max' && (
                <p className="mt-2 text-xs text-slate-400">
                  One-time payment. Certificate is yours forever.{' '}
                  <Link href="/pricing" className="underline underline-offset-2 hover:text-slate-600">Upgrade to Max</Link> for free certificates.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default function CertificatesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" /></div>}>
      <CertificatesPageInner />
    </Suspense>
  )
}
