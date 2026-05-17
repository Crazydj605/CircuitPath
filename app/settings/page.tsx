'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, LogOut, User, Settings as SettingsIcon, Cpu, CheckCircle2, Trash2, AlertTriangle, Zap, Lock } from 'lucide-react'
import Link from 'next/link'
import { supabase, signOut } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

type Preferences = {
  board_type: string
  beginner_tips_enabled: boolean
  reminder_cadence: 'off' | 'daily' | 'weekly'
  notifications_enabled: boolean
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-slate-900' : 'bg-slate-200'
      }`}
    >
      <span
        className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

// Confirmation modal for account deletion
function DeleteModal({
  onConfirm,
  onCancel,
  deleting,
}: {
  onConfirm: () => void
  onCancel: () => void
  deleting: boolean
}) {
  const [typed, setTyped] = useState('')
  const confirmed = typed.trim().toLowerCase() === 'delete'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-md shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-red-100 bg-red-50">
          <div className="w-9 h-9 bg-red-100 rounded flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-red-800">Delete your account?</p>
            <p className="text-xs text-red-500">This cannot be undone.</p>
          </div>
        </div>

        <div className="p-5">
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            This will permanently delete your account, all lesson progress, streaks, and preferences.
            <span className="font-semibold text-slate-900"> There is no way to recover this data.</span>
          </p>

          <div className="mb-5">
            <label className="block text-sm text-slate-500 mb-1.5">
              Type <span className="font-mono font-semibold text-slate-800">delete</span> to confirm
            </label>
            <input
              type="text"
              value={typed}
              onChange={e => setTyped(e.target.value)}
              placeholder="delete"
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-red-400 transition-colors"
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              disabled={!confirmed || deleting}
              className="flex-1 py-2.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {deleting ? 'Deleting...' : 'Yes, delete my account'}
            </button>
            <button
              onClick={onCancel}
              disabled={deleting}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-200 disabled:opacity-40 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Settings() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userTier, setUserTier] = useState<string>('free')
  const [userXp, setUserXp] = useState(0)
  const [loading, setLoading] = useState(true)
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [cancelStep, setCancelStep] = useState<'none' | 'confirm' | 'offer' | 'cancelled' | 'discounted'>('none')
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const [publicSlug, setPublicSlug] = useState('')
  const [publicProfileEnabled, setPublicProfileEnabled] = useState(false)
  const [slugError, setSlugError] = useState('')
  const [preferences, setPreferences] = useState<Preferences>({
    board_type: 'Arduino Uno',
    beginner_tips_enabled: true,
    reminder_cadence: 'daily',
    notifications_enabled: true,
  })

  useEffect(() => {
    const bootstrap = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }
      setUser(session.user)
      setDisplayName(session.user.email?.split('@')[0] || '')

      const { data: profile } = await supabase
        .from('profiles')
        .select('name, subscription_tier, xp, public_slug, public_profile_enabled')
        .eq('id', session.user.id)
        .maybeSingle()
      if (profile?.name) setDisplayName(profile.name)
      setUserTier(profile?.subscription_tier || 'free')
      setUserXp(profile?.xp || 0)
      setPublicSlug(profile?.public_slug || '')
      setPublicProfileEnabled(!!profile?.public_profile_enabled)

      const { data: prefRow } = await supabase
        .from('learning_user_preferences').select('*').eq('user_id', session.user.id).maybeSingle()
      if (prefRow) {
        setPreferences({
          board_type: prefRow.board_type,
          beginner_tips_enabled: prefRow.beginner_tips_enabled,
          reminder_cadence: prefRow.reminder_cadence,
          notifications_enabled: prefRow.notifications_enabled,
        })
      }
      setLoading(false)
    }
    bootstrap()
  }, [router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const saveSettings = async () => {
    if (!user) return
    setSaving(true)
    setErrorMsg('')
    setSaved(false)

    // Validate slug if changed and public profile is enabled
    const cleanSlug = publicSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (publicProfileEnabled && (cleanSlug.length < 3 || cleanSlug.length > 30)) {
      setSlugError('Profile URL must be 3–30 characters (letters, numbers, dashes).')
      setSaving(false)
      return
    }
    setSlugError('')

    const profilePayload: Record<string, unknown> = {
      id: user.id,
      email: user.email,
      name: displayName,
      updated_at: new Date().toISOString(),
      public_profile_enabled: userTier === 'max' ? publicProfileEnabled : false,
    }
    if (cleanSlug) profilePayload.public_slug = cleanSlug

    const { error: profileError } = await supabase.from('profiles').upsert(profilePayload, { onConflict: 'id' })

    const { error: prefError } = await supabase.from('learning_user_preferences').upsert(
      { user_id: user.id, ...preferences, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )

    if (profileError || prefError) {
      setErrorMsg('Could not save settings. Please check your database migration and try again.')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    setDeleteError('')

    const { error } = await supabase.rpc('delete_user')

    if (error) {
      setDeleteError(
        error.message.includes('function')
          ? 'The delete_user SQL function is missing. Please run it in your Supabase SQL Editor first.'
          : `Error: ${error.message}`
      )
      setDeleting(false)
      return
    }

    // Sign out locally and go home
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleCancelSubscription = async () => {
    setCancelLoading(true)
    setCancelError('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setCancelError('Not logged in'); setCancelLoading(false); return }
    const res = await fetch('/api/stripe/cancel-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userToken: session.access_token }),
    })
    if (res.ok) {
      setCancelStep('cancelled')
    } else {
      const err = await res.json()
      setCancelError(err.error || 'Something went wrong. Please try again.')
    }
    setCancelLoading(false)
  }

  const handleApplyDiscount = async () => {
    setCancelLoading(true)
    setCancelError('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setCancelError('Not logged in'); setCancelLoading(false); return }
    const res = await fetch('/api/stripe/apply-discount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userToken: session.access_token }),
    })
    if (res.ok) {
      setCancelStep('discounted')
    } else {
      const err = await res.json()
      setCancelError(err.error || 'Something went wrong. Please try again.')
    }
    setCancelLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <main className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="pt-20 pb-16">

          {/* Header */}
          <div className="bg-white border-b border-slate-200 px-4 py-8">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Settings</h1>
              <p className="text-slate-500 text-sm">Manage your profile and learning preferences.</p>
            </div>
          </div>

          <div className="max-w-3xl mx-auto px-4 mt-6 space-y-5">

            {/* Profile */}
            <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50">
                <User className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-700">Profile</h2>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 bg-slate-100 rounded-md flex items-center justify-center text-slate-700 text-xl font-bold">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{displayName || user?.email?.split('@')[0]}</p>
                    <p className="text-sm text-slate-400">{user?.email}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1.5">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-500 transition-colors"
                    placeholder="Your name"
                  />
                </div>

                {/* Public profile (Max only) */}
                <div className="mt-5 pt-5 border-t border-slate-100">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        Public profile page
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded">
                          MAX
                        </span>
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Share your progress at <span className="font-mono">circuitpath.net/u/&lt;your-slug&gt;</span>. Recruiters can verify your badges.
                      </p>
                    </div>
                    <Toggle
                      checked={publicProfileEnabled}
                      onChange={(v) => {
                        if (userTier !== 'max') return
                        setPublicProfileEnabled(v)
                      }}
                    />
                  </div>
                  {userTier !== 'max' && (
                    <p className="text-xs text-amber-600 flex items-center gap-1.5">
                      <Lock className="w-3 h-3" /> Upgrade to Max to enable a public profile.
                    </p>
                  )}
                  {publicProfileEnabled && (
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Profile URL slug</label>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400 font-mono">circuitpath.net/u/</span>
                        <input
                          type="text"
                          value={publicSlug}
                          onChange={(e) => setPublicSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                          maxLength={30}
                          className="flex-1 bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-500"
                          placeholder="your-slug"
                        />
                      </div>
                      {slugError && <p className="mt-1 text-xs text-red-600">{slugError}</p>}
                      {publicSlug && !slugError && (
                        <a
                          href={`/u/${publicSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1.5 inline-flex items-center gap-1 text-xs text-violet-700 hover:underline"
                        >
                          Preview your profile →
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Learning preferences */}
            <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50">
                <Cpu className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-700">Learning Preferences</h2>
              </div>
              <div className="divide-y divide-slate-100">

                <div className="px-5 py-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Arduino board type</label>
                  <p className="text-xs text-slate-400 mb-2">Used to tailor code examples in lessons.</p>
                  <select
                    value={preferences.board_type}
                    onChange={e => setPreferences(prev => ({ ...prev, board_type: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-500 transition-colors"
                  >
                    <option>Arduino Uno</option>
                    <option>Arduino Nano</option>
                    <option>Arduino Mega</option>
                  </select>
                </div>

                <div className="px-5 py-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Learning reminder</label>
                  <p className="text-xs text-slate-400 mb-2">How often you want to be nudged to keep your streak.</p>
                  <select
                    value={preferences.reminder_cadence}
                    onChange={e => setPreferences(prev => ({ ...prev, reminder_cadence: e.target.value as Preferences['reminder_cadence'] }))}
                    className="w-full bg-white border border-slate-300 rounded-md px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-500 transition-colors"
                  >
                    <option value="off">Off</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Beginner tips in lessons</p>
                    <p className="text-xs text-slate-400 mt-0.5">Show helpful hints for new concepts</p>
                  </div>
                  <Toggle
                    checked={preferences.beginner_tips_enabled}
                    onChange={v => setPreferences(prev => ({ ...prev, beginner_tips_enabled: v }))}
                  />
                </div>

                <div className="px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-100 rounded flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">Notifications</p>
                      <p className="text-xs text-slate-400 mt-0.5">Learning reminders and updates</p>
                    </div>
                  </div>
                  <Toggle
                    checked={preferences.notifications_enabled}
                    onChange={v => setPreferences(prev => ({ ...prev, notifications_enabled: v }))}
                  />
                </div>
              </div>
            </div>

            {/* Save */}
            <div className="flex items-center gap-4">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : 'Save settings'}
              </button>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-green-600">
                  <CheckCircle2 className="w-4 h-4" /> Saved!
                </span>
              )}
              {errorMsg && <span className="text-sm text-red-600">{errorMsg}</span>}
            </div>

            {/* Plan & Billing */}
            <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50">
                <Zap className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-700">Plan & Billing</h2>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Current plan</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-base font-bold ${
                        userTier === 'max' ? 'text-violet-700' :
                        userTier === 'pro' || userTier === 'premium' ? 'text-slate-900' :
                        'text-slate-600'
                      }`}>
                        {userTier === 'max' ? 'Max' : userTier === 'pro' || userTier === 'premium' ? 'Pro' : 'Free'}
                      </span>
                      {userTier === 'free' && (
                        <span className="text-xs text-slate-400">— 2 lessons included</span>
                      )}
                      {(userTier === 'pro' || userTier === 'premium') && (
                        <span className="text-xs text-green-600 font-medium">Full access</span>
                      )}
                      {userTier === 'max' && (
                        <span className="text-xs text-violet-600 font-medium">Everything unlocked</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span className="text-xs font-semibold text-amber-700">{userXp} XP</span>
                  </div>
                </div>
                {userTier === 'free' && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-md flex items-start gap-3 mb-4">
                    <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-500 leading-relaxed">
                      You are on the Free plan. Upgrade to Pro to unlock all lessons, progress tracking, and new content added every month.
                    </p>
                  </div>
                )}
                {userTier !== 'max' && (
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
                  >
                    <Zap className="w-4 h-4 text-amber-400" />
                    {userTier === 'free' ? 'Upgrade to Pro' : 'Upgrade to Max'}
                  </Link>
                )}
                {userTier === 'max' && (
                  <p className="text-sm text-slate-500">You have the highest plan. Thank you for supporting CircuitPath!</p>
                )}

                {/* Cancel plan flow */}
                {(userTier === 'pro' || userTier === 'premium' || userTier === 'max') && cancelStep === 'none' && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => { setCancelStep('confirm'); setCancelError('') }}
                      className="text-sm text-slate-400 hover:text-red-600 transition-colors underline underline-offset-2"
                    >
                      Cancel my plan
                    </button>
                  </div>
                )}

                {cancelStep === 'confirm' && (
                  <div className="mt-4 pt-4 border-t border-slate-100 p-4 bg-slate-50 rounded-md space-y-3">
                    <p className="text-sm font-semibold text-slate-900">Are you sure you want to cancel?</p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      You will keep full access until the end of your current billing period. After that, your plan downgrades to Free.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCancelStep('offer')}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
                      >
                        Yes, cancel my plan
                      </button>
                      <button
                        onClick={() => setCancelStep('none')}
                        className="flex-1 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors"
                      >
                        Go back
                      </button>
                    </div>
                  </div>
                )}

                {cancelStep === 'offer' && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-md space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🎁</span>
                        <p className="text-sm font-bold text-slate-900">Wait — stay and save 30%</p>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        As a thank-you for being a CircuitPath member, we will apply a <span className="font-semibold">30% discount to your next month</span> — no commitment required. You can still cancel after that.
                      </p>
                      {cancelError && <p className="text-xs text-red-600">{cancelError}</p>}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={handleApplyDiscount}
                          disabled={cancelLoading}
                          className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-md transition-colors disabled:opacity-50"
                        >
                          {cancelLoading ? 'Applying…' : 'Apply 30% Discount — Keep Access'}
                        </button>
                        <button
                          onClick={handleCancelSubscription}
                          disabled={cancelLoading}
                          className="w-full py-2 text-xs text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50"
                        >
                          {cancelLoading ? '…' : 'No thanks, cancel my plan anyway'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {cancelStep === 'discounted' && (
                  <div className="mt-4 pt-4 border-t border-slate-100 p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm font-semibold text-green-800 mb-1">🎉 30% discount applied!</p>
                    <p className="text-xs text-green-700 leading-relaxed">
                      Your next billing will be 30% off. Your plan stays active — thank you for sticking with CircuitPath!
                    </p>
                  </div>
                )}

                {cancelStep === 'cancelled' && (
                  <div className="mt-4 pt-4 border-t border-slate-100 p-4 bg-slate-50 border border-slate-200 rounded-md">
                    <p className="text-sm font-semibold text-slate-900 mb-1">Plan cancellation scheduled</p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Your plan will remain active until the end of your billing period. After that it will downgrade to Free. Changed your mind? Contact us anytime.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Account actions */}
            <div className="bg-white border border-red-200 rounded-md overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-red-100 bg-red-50">
                <SettingsIcon className="w-4 h-4 text-red-400" />
                <h2 className="text-sm font-semibold text-red-700">Account</h2>
              </div>
              <div className="p-5 space-y-3">

                {/* Sign out */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 p-3 w-full bg-white border border-slate-200 rounded-md hover:bg-red-50 hover:border-red-200 transition-colors text-left"
                >
                  <div className="w-9 h-9 bg-red-100 rounded flex items-center justify-center shrink-0">
                    <LogOut className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Sign out</p>
                    <p className="text-xs text-slate-400">Log out securely from this device</p>
                  </div>
                </button>

                {/* Delete account */}
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-3 p-3 w-full bg-white border border-red-200 rounded-md hover:bg-red-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 bg-red-100 rounded flex items-center justify-center shrink-0">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-700">Delete account</p>
                    <p className="text-xs text-slate-400">Permanently delete your account and all data</p>
                  </div>
                </button>

                {deleteError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-700">{deleteError}</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <DeleteModal
          onConfirm={handleDeleteAccount}
          onCancel={() => { setShowDeleteModal(false); setDeleteError('') }}
          deleting={deleting}
        />
      )}
    </>
  )
}
