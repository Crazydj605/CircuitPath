'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, LogOut } from 'lucide-react'
import { supabase, signOut } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

type Preferences = {
  board_type: string
  beginner_tips_enabled: boolean
  reminder_cadence: 'off' | 'daily' | 'weekly'
  notifications_enabled: boolean
}

export default function Settings() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [preferences, setPreferences] = useState<Preferences>({
    board_type: 'Arduino Uno',
    beginner_tips_enabled: true,
    reminder_cadence: 'daily',
    notifications_enabled: true,
  })

  useEffect(() => {
    const bootstrap = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
        return
      }
      setUser(session.user)
      setDisplayName(session.user.email?.split('@')[0] || '')

      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', session.user.id)
        .maybeSingle()

      if (profile?.name) setDisplayName(profile.name)

      const { data: prefRow } = await supabase
        .from('learning_user_preferences')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle()

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
    setStatus('')

    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        email: user.email,
        name: displayName,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )

    const { error: prefError } = await supabase.from('learning_user_preferences').upsert(
      {
        user_id: user.id,
        ...preferences,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

    if (profileError || prefError) {
      setStatus('Could not save settings yet. Please check your database migration and try again.')
    } else {
      setStatus('Settings saved.')
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
            <p className="text-slate-500">
              Keep your learning setup simple and personalized.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-6 bg-white border border-slate-200 rounded">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 bg-slate-200 rounded-full flex items-center justify-center text-slate-800 text-xl font-semibold">
                  {user?.email?.[0].toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="text-slate-900 font-semibold">Profile</h2>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm text-slate-500">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded">
              <h2 className="text-slate-900 font-semibold mb-4">Learning Preferences</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-slate-500 mb-2">Board type</label>
                  <select
                    value={preferences.board_type}
                    onChange={(e) => setPreferences((prev) => ({ ...prev, board_type: e.target.value }))}
                    className="w-full bg-white border border-slate-300 rounded px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-500"
                  >
                    <option>Arduino Uno</option>
                    <option>Arduino Nano</option>
                    <option>Arduino Mega</option>
                  </select>
                </div>

                <label className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-sm text-slate-700">Beginner tips in lessons</span>
                  <input
                    type="checkbox"
                    checked={preferences.beginner_tips_enabled}
                    onChange={(e) => setPreferences((prev) => ({ ...prev, beginner_tips_enabled: e.target.checked }))}
                    className="h-4 w-4"
                  />
                </label>

                <div>
                  <label className="block text-sm text-slate-500 mb-2">Reminder cadence</label>
                  <select
                    value={preferences.reminder_cadence}
                    onChange={(e) =>
                      setPreferences((prev) => ({
                        ...prev,
                        reminder_cadence: e.target.value as Preferences['reminder_cadence'],
                      }))
                    }
                    className="w-full bg-white border border-slate-300 rounded px-4 py-3 text-slate-900 focus:outline-none focus:border-slate-500"
                  >
                    <option value="off">Off</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <label className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
                      <Bell className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-slate-900 font-medium">Notifications</p>
                      <p className="text-sm text-slate-500">Learning reminder messages</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.notifications_enabled}
                    onChange={(e) => setPreferences((prev) => ({ ...prev, notifications_enabled: e.target.checked }))}
                    className="h-4 w-4"
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="px-4 py-2 bg-slate-900 border border-slate-900 rounded text-white text-sm hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save settings'}
              </button>
              {status && <p className="text-sm text-slate-600">{status}</p>}
            </div>

            <div className="p-6 bg-red-50 border border-red-200 rounded">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 p-3 bg-white border border-slate-200 rounded hover:bg-red-50 hover:border-red-200 transition-colors"
              >
                <div className="w-9 h-9 bg-red-100 rounded flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-red-600" />
                </div>
                <div className="text-left">
                  <p className="text-slate-900 font-medium">Sign Out</p>
                  <p className="text-sm text-slate-500">Log out securely from this device</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
