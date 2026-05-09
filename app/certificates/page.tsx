'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Award, Download, Lock, Check, ChevronRight } from 'lucide-react'
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
        }
        @media screen {
          .certificate-wrapper { padding: 24px; }
        }
      `}</style>
      <div className="certificate max-w-2xl mx-auto bg-white border-4 border-double border-slate-800 rounded-sm p-12 text-center shadow-xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <Award className="w-9 h-9 text-amber-600" />
          </div>
        </div>
        <p className="text-xs tracking-[0.3em] uppercase text-slate-400 mb-2">CircuitPath</p>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Certificate of Completion</h1>
        <div className="w-16 h-0.5 bg-amber-400 mx-auto my-4" />
        <p className="text-sm text-slate-500 mb-2">This certifies that</p>
        <p className="text-3xl font-semibold text-slate-900 mb-2" style={{ fontFamily: 'Georgia, serif' }}>{name}</p>
        <p className="text-sm text-slate-500 mb-1">has successfully completed</p>
        <p className="text-xl font-bold text-slate-800 mb-6">{lesson.title}</p>
        <div className="w-16 h-0.5 bg-slate-200 mx-auto mb-6" />
        <div className="flex items-center justify-center gap-8 text-xs text-slate-400">
          <div>
            <p className="font-medium text-slate-600 mb-0.5">{date}</p>
            <p>Date Issued</p>
          </div>
          <div>
            <p className="font-medium text-slate-600 mb-0.5">CircuitPath</p>
            <p>Issuing Authority</p>
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-6 no-print">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-md hover:bg-slate-800 transition-colors"
        >
          <Download className="w-4 h-4" /> Save as PDF (Print → Save as PDF)
        </button>
      </div>
    </div>
  )
}

export default function CertificatesPage() {
  const router = useRouter()
  const [userToken, setUserToken] = useState<string | null>(null)
  const [tier, setTier] = useState<string>('free')
  const [lessons, setLessons] = useState<CompletedLesson[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<CompletedLesson | null>(null)
  const [nameInput, setNameInput] = useState('')
  const [certData, setCertData] = useState<{ name: string; issuedAt: string } | null>(null)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')

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
    const res = await fetch('/api/certificates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lesson_slug: selected.slug, recipient_name: nameInput.trim(), userToken }),
    })
    const d = await res.json()
    if (res.ok) {
      setCertData({ name: d.recipient_name, issuedAt: d.issued_at })
      setLessons(prev => prev.map(l => l.slug === selected.slug ? { ...l, certificate: { recipient_name: d.recipient_name, issued_at: d.issued_at } } : l))
    } else if (d.error === 'upgrade_required') {
      setGenError('Certificates are free for Max tier members. Upgrade to Max to generate unlimited certificates.')
    } else {
      setGenError(d.error || 'Something went wrong')
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
            {tier !== 'max' && (
              <div className="ml-10 mt-3 inline-flex items-center gap-2 text-xs bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-md">
                <Lock className="w-3.5 h-3.5" />
                Certificates are free for Max tier.{' '}
                <Link href="/pricing" className="font-semibold underline underline-offset-2">Upgrade</Link>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 mt-8">
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
                        <Check className="w-3.5 h-3.5" /> Certificate issued to {lesson.certificate.recipient_name}
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
                        <Award className="w-3.5 h-3.5" /> Get Certificate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Certificate name form */}
          {selected && !certData && (
            <div className="mt-6 bg-white border border-slate-200 rounded-md p-5">
              <h3 className="font-semibold text-slate-900 text-sm mb-1">
                Certificate for: <span className="text-amber-600">{selected.title}</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">This name will appear on your certificate. Use your full name exactly as you want it printed.</p>
              {tier !== 'max' ? (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-md">
                  <Lock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Max tier required</p>
                    <p className="text-xs text-slate-500 mt-0.5">Upgrade to Max to generate unlimited certificates for all your completed lessons.</p>
                    <Link href="/pricing" className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-md transition-colors">
                      Upgrade to Max
                    </Link>
                  </div>
                </div>
              ) : (
                <>
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
                    {generating ? 'Generating…' : 'Generate Certificate'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
