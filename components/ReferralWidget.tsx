'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, Users, Gift, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ReferralWidget() {
  const [code, setCode] = useState<string | null>(null)
  const [referralCount, setReferralCount] = useState(0)
  const [bonusWeeks, setBonusWeeks] = useState(0)
  const [copied, setCopied] = useState(false)
  const [inputCode, setInputCode] = useState('')
  const [claimStatus, setClaimStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [claimMsg, setClaimMsg] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const res = await fetch('/api/referral', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) {
        const d = await res.json()
        setCode(d.referral_code)
        setReferralCount(d.referral_count)
        setBonusWeeks(d.bonus_weeks)
      }
    }
    load()
  }, [])

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://circuitpath.net'
  const referralLink = code ? `${baseUrl}/?ref=${code}` : null

  const copyLink = () => {
    if (!referralLink) return
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const claimCode = async () => {
    if (!inputCode.trim()) return
    setClaimStatus('loading')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const res = await fetch('/api/referral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referral_code: inputCode.trim().toUpperCase(), userToken: session.access_token }),
    })
    const d = await res.json()
    if (res.ok) {
      setClaimStatus('success')
      setClaimMsg(d.message)
      setBonusWeeks(prev => prev + 4)
    } else {
      setClaimStatus('error')
      setClaimMsg(d.error || 'Something went wrong')
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
        <div className="w-8 h-8 bg-violet-100 rounded flex items-center justify-center shrink-0">
          <Gift className="w-4 h-4 text-violet-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Refer a Friend</h3>
          <p className="text-xs text-slate-400">Both of you get 1 month of Pro free</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-md p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500">Referrals</span>
            </div>
            <p className="text-xl font-bold text-slate-900">{referralCount}</p>
          </div>
          <div className="bg-violet-50 rounded-md p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Gift className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs text-slate-500">Bonus months</span>
            </div>
            <p className="text-xl font-bold text-violet-700">{Math.round(bonusWeeks / 4)}<span className="text-sm font-normal text-slate-400"> earned</span></p>
          </div>
        </div>

        {/* Share link */}
        {referralLink && (
          <div>
            <p className="text-xs text-slate-500 mb-1.5 font-medium">Your referral link</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-600 truncate font-mono">
                {referralLink}
              </div>
              <button
                onClick={copyLink}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                  copied ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>
          </div>
        )}

        {/* Claim a code */}
        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-500 mb-1.5 font-medium">Have a referral code?</p>
          {claimStatus === 'success' ? (
            <p className="text-sm text-green-700 flex items-center gap-1.5">
              <Check className="w-4 h-4" /> {claimMsg}
            </p>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={e => setInputCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                maxLength={12}
                className="flex-1 text-sm border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:border-slate-400 font-mono"
              />
              <button
                onClick={claimCode}
                disabled={claimStatus === 'loading' || !inputCode.trim()}
                className="shrink-0 flex items-center gap-1 px-3 py-2 bg-violet-600 text-white text-xs font-semibold rounded-md hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Apply <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {claimStatus === 'error' && <p className="text-xs text-red-600 mt-1">{claimMsg}</p>}
        </div>
      </div>
    </div>
  )
}
