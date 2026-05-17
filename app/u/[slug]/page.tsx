import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Crown, Trophy, Flame, BookOpen, Award, Calendar } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const admin = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })

type Props = { params: { slug: string } }

async function loadProfile(slug: string) {
  const { data: profile } = await admin
    .from('profiles')
    .select('id, name, email, subscription_tier, xp, created_at, public_profile_enabled')
    .eq('public_slug', slug)
    .maybeSingle()
  if (!profile) return null
  // Only Max users get public profiles; everyone else is private.
  if (profile.subscription_tier !== 'max' || !profile.public_profile_enabled) {
    return null
  }

  const [streakRes, completedRes, badgesRes] = await Promise.all([
    admin.from('learning_user_streaks').select('current_streak_days, longest_streak_days').eq('user_id', profile.id).maybeSingle(),
    admin.from('learning_user_lesson_progress').select('lesson_id, completed_at').eq('user_id', profile.id).eq('status', 'completed'),
    admin.from('user_badges').select('badge_id, earned_at, badges(slug, name, description, icon, color, category)').eq('user_id', profile.id),
  ])

  const lessonIds = (completedRes.data ?? []).map((r) => r.lesson_id)
  const { data: lessons } = lessonIds.length
    ? await admin.from('learning_lessons').select('id, slug, title, difficulty').in('id', lessonIds)
    : { data: [] }

  return { profile, streak: streakRes.data, completed: completedRes.data ?? [], badges: badgesRes.data ?? [], lessons: lessons ?? [] }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await loadProfile(params.slug)
  if (!data) return { title: 'Profile not found' }
  const display = data.profile.name || data.profile.email?.split('@')[0] || params.slug
  return {
    title: `${display}'s Profile`,
    description: `${display} on CircuitPath — ${data.profile.xp} XP, ${data.completed.length} lessons completed, ${data.badges.length} badges earned.`,
    openGraph: {
      title: `${display} · CircuitPath`,
      description: `${data.profile.xp} XP · ${data.completed.length} lessons · ${data.badges.length} badges`,
    },
    robots: { index: true, follow: true },
  }
}

export default async function PublicProfile({ params }: Props) {
  const data = await loadProfile(params.slug)
  if (!data) notFound()

  const { profile, streak, completed, badges, lessons } = data
  const display = profile.name || profile.email?.split('@')[0] || params.slug
  const joined = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const lessonMap = new Map((lessons as any[]).map((l: any) => [l.id, l]))

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-slate-900">
            CircuitPath
          </Link>
          <Link
            href="/pricing"
            className="text-xs font-semibold px-3 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800"
          >
            Get your own profile
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="bg-white border border-slate-200 rounded-md p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-violet-700">
                {display[0]?.toUpperCase() ?? '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-slate-900 truncate">{display}</h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full text-[10px] font-bold">
                  <Crown className="w-2.5 h-2.5" /> MAX
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Joined {joined}
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Trophy className="w-4 h-4 text-violet-500" />
                  <strong>{profile.xp.toLocaleString()}</strong> XP
                </span>
                {streak && (
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <strong>{streak.current_streak_days}</strong> day streak
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-slate-700">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <strong>{completed.length}</strong> lessons completed
                </span>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Award className="w-4 h-4 text-green-500" />
                  <strong>{badges.length}</strong> badges earned
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <section className="bg-white border border-slate-200 rounded-md p-6 mb-6">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Badges</h2>
            <div className="grid grid-cols-6 md:grid-cols-10 gap-3">
              {badges.map((b: any) => (
                <div
                  key={b.badge_id}
                  className="aspect-square rounded-lg flex items-center justify-center text-2xl ring-1 ring-black/5"
                  style={{ background: (b.badges?.color ?? '#a855f7') + '22' }}
                  title={`${b.badges?.name} — ${b.badges?.description}`}
                >
                  {b.badges?.icon}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Completed lessons */}
        <section className="bg-white border border-slate-200 rounded-md p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Completed lessons</h2>
          {completed.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No completed lessons yet.</p>
          ) : (
            <ul className="space-y-2">
              {completed.map((c: any) => {
                const lesson = lessonMap.get(c.lesson_id)
                if (!lesson) return null
                return (
                  <li
                    key={c.lesson_id}
                    className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{lesson.title}</p>
                      <p className="text-xs text-slate-500">
                        {lesson.difficulty}
                        {c.completed_at && ` · ${new Date(c.completed_at).toLocaleDateString()}`}
                      </p>
                    </div>
                    <Link
                      href={`/learn/${lesson.slug}`}
                      className="text-xs font-medium text-slate-500 hover:text-slate-900 shrink-0"
                    >
                      View →
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <footer className="mt-8 text-center text-xs text-slate-400">
          This is a public CircuitPath profile · <Link href="/" className="underline hover:text-slate-700">Make your own</Link>
        </footer>
      </div>
    </main>
  )
}
