'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, Mail, Bell, Shield, CreditCard, LogOut,
  ChevronRight, Moon, Globe, CheckCircle
} from 'lucide-react'
import { supabase, signOut } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

export default function Settings() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/')
        return
      }
      setUser(session.user)
      setLoading(false)
    })
  }, [router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-gray-400">
              Manage your account, notifications, and preferences
            </p>
          </div>

          <div className="space-y-6">
            {/* Profile Section */}
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                  {user?.email?.[0].toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="text-white font-semibold">Profile</h2>
                  <p className="text-sm text-gray-400">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Display Name</label>
                  <input
                    type="text"
                    defaultValue={user?.email?.split('@')[0]}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm hover:bg-white/10 transition-colors">
                  Update Profile
                </button>
              </div>
            </div>

            {/* Account Settings */}
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
              <h2 className="text-white font-semibold mb-4">Account</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium">Email Address</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </button>

                <button className="w-full flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium">Subscription</p>
                      <p className="text-sm text-gray-500">Free Plan</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </button>

                <button className="w-full flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium">Password</p>
                      <p className="text-sm text-gray-500">Last changed 30 days ago</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Preferences */}
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
              <h2 className="text-white font-semibold mb-4">Preferences</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <Bell className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Notifications</p>
                      <p className="text-sm text-gray-500">Email and push notifications</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                      <Moon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Dark Mode</p>
                      <p className="text-sm text-gray-500">Always use dark theme</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked disabled />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500 opacity-50"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Language</p>
                      <p className="text-sm text-gray-500">English (US)</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="p-6 bg-red-500/[0.02] border border-red-500/10 rounded-2xl">
              <h2 className="text-red-400 font-semibold mb-4">Danger Zone</h2>
              <div className="space-y-3">
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-red-500/10 hover:border-red-500/20 transition-colors"
                >
                  <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                    <LogOut className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">Sign Out</p>
                    <p className="text-sm text-gray-500">Log out of your account</p>
                  </div>
                </button>

                <button className="w-full flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-red-500/10 hover:border-red-500/20 transition-colors">
                  <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-red-400 font-medium">Delete Account</p>
                    <p className="text-sm text-gray-500">Permanently delete your account and data</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
