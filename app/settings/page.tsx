'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, LogOut, User, Settings as SettingsIcon, Cpu, CheckCircle2 } from 'lucide-react'
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

export default function Settings() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
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
        .from('profiles').select('name').eq('id', session.user.id).maybeSingle()
      if (profile?.name) setDisplayName(profile.name)

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

    const { error: profileError } = await supabase.from('profiles').upsert(
      { id: user.id, email: user.email, name: displayName, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    )

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
      </div>
    )
  }

  return (
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

          {/* Profile section */}
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
            </div>
          </div>

          {/* Learning preferences */}
          <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50">
              <Cpu className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-700">Learning Preferences</h2>
            </div>
            <div className="divide-y divide-slate-100">

              {/* Board type */}
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

              {/* Reminder cadence */}
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

              {/* Beginner tips toggle */}
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

              {/* Notifications toggle */}
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

          {/* Save button */}
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
            {errorMsg && (
              <span className="text-sm text-red-600">{errorMsg}</span>
            )}
          </div>

          {/* Danger zone */}
          <div className="bg-white border border-red-200 rounded-md overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-red-100 bg-red-50">
              <SettingsIcon className="w-4 h-4 text-red-400" />
              <h2 className="text-sm font-semibold text-red-700">Account</h2>
            </div>
            <div className="p-5">
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
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
