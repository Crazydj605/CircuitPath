import { supabase } from '@/lib/supabase'
import type {
  LearningLesson,
  LearningLessonStep,
  LearningUserLessonProgress,
  LearningUserStreak,
} from '@/types'

type LessonWithProgress = LearningLesson & {
  progress: LearningUserLessonProgress | null
}

export async function getLessonLibrary(): Promise<LessonWithProgress[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: lessons, error: lessonError } = await supabase
    .from('learning_lessons')
    .select('*')
    .eq('is_published', true)
    .order('order_index', { ascending: true })

  if (lessonError || !lessons) return []

  const lessonIds = lessons.map((lesson) => lesson.id)
  const { data: progressRows } = await supabase
    .from('learning_user_lesson_progress')
    .select('*')
    .eq('user_id', user.id)
    .in('lesson_id', lessonIds)

  const progressByLesson = new Map<string, LearningUserLessonProgress>()
  for (const row of progressRows || []) {
    progressByLesson.set(row.lesson_id, row as LearningUserLessonProgress)
  }

  return lessons.map((lesson) => ({
    ...(lesson as LearningLesson),
    progress: progressByLesson.get(lesson.id) || null,
  }))
}

export async function getLessonBySlug(slug: string): Promise<{
  lesson: LearningLesson | null
  steps: LearningLessonStep[]
  progress: LearningUserLessonProgress | null
}> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { lesson: null, steps: [], progress: null }

  const { data: lesson, error: lessonError } = await supabase
    .from('learning_lessons')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (lessonError || !lesson) return { lesson: null, steps: [], progress: null }

  const { data: steps } = await supabase
    .from('learning_lesson_steps')
    .select('*')
    .eq('lesson_id', lesson.id)
    .order('step_index', { ascending: true })

  const { data: progress } = await supabase
    .from('learning_user_lesson_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('lesson_id', lesson.id)
    .maybeSingle()

  return {
    lesson: lesson as LearningLesson,
    steps: (steps || []) as LearningLessonStep[],
    progress: (progress as LearningUserLessonProgress | null) || null,
  }
}

export async function saveLessonProgress(params: {
  lessonId: string
  currentStepIndex: number
  completedSteps: number[]
  isCompleted: boolean
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: new Error('Not signed in') }

  const now = new Date().toISOString()
  const status = params.isCompleted ? 'completed' : 'in_progress'

  const { error } = await supabase.from('learning_user_lesson_progress').upsert(
    {
      user_id: user.id,
      lesson_id: params.lessonId,
      status,
      current_step_index: params.currentStepIndex,
      completed_steps: params.completedSteps,
      started_at: now,
      completed_at: params.isCompleted ? now : null,
      last_seen_at: now,
    },
    {
      onConflict: 'user_id,lesson_id',
    }
  )

  return { error }
}

export async function submitStepCheck(params: {
  lessonId: string
  stepId: string
  localDate: string
  isCorrect: boolean
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: new Error('Not signed in') }

  const { data: existing } = await supabase
    .from('learning_user_step_checks')
    .select('attempt_count')
    .eq('user_id', user.id)
    .eq('lesson_id', params.lessonId)
    .eq('step_id', params.stepId)
    .maybeSingle()

  const currentAttemptCount = existing?.attempt_count || 0

  const { error: checkError } = await supabase.from('learning_user_step_checks').upsert(
    {
      user_id: user.id,
      lesson_id: params.lessonId,
      step_id: params.stepId,
      is_correct: params.isCorrect,
      attempt_count: currentAttemptCount + 1,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id,lesson_id,step_id',
    }
  )

  if (checkError) return { error: checkError }

  // Award 50 XP on first correct step completion
  if (!existing && params.isCorrect) {
    const sourceId = `step_${params.stepId}`
    const { error: logError } = await supabase
      .from('learning_xp_log')
      .insert({ user_id: user.id, source_id: sourceId, xp_amount: 50 })
    if (!logError) {
      await supabase.rpc('increment_user_xp', { p_user_id: user.id, p_amount: 50 })
    }
  }

  const { data: streak } = await supabase
    .from('learning_user_streaks')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  let currentStreak = 1
  let longestStreak = 1

  if (streak?.last_activity_date) {
    if (streak.last_activity_date === params.localDate) {
      currentStreak = streak.current_streak_days
      longestStreak = streak.longest_streak_days
    } else {
      const lastDate = new Date(`${streak.last_activity_date}T00:00:00`)
      const todayDate = new Date(`${params.localDate}T00:00:00`)
      const dayDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / 86400000)

      if (dayDiff === 1) {
        currentStreak = streak.current_streak_days + 1
      } else {
        currentStreak = 1
      }
      longestStreak = Math.max(streak.longest_streak_days, currentStreak)
    }
  }

  const { error: streakError } = await supabase.from('learning_user_streaks').upsert(
    {
      user_id: user.id,
      current_streak_days: currentStreak,
      longest_streak_days: longestStreak,
      last_activity_date: params.localDate,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id',
    }
  )

  // Check for new badges (fire and forget)
  checkAndAwardBadges(user.id).catch(() => {})

  return { error: streakError }
}

export async function checkAndAwardBadges(userId: string) {
  const [
    { data: profile },
    { data: streak },
    { data: progress },
    { data: dailyResponses },
    { data: allBadges },
    { data: earnedBadges },
  ] = await Promise.all([
    supabase.from('profiles').select('xp').eq('id', userId).maybeSingle(),
    supabase.from('learning_user_streaks').select('current_streak_days').eq('user_id', userId).maybeSingle(),
    supabase.from('learning_user_lesson_progress').select('status').eq('user_id', userId).eq('status', 'completed'),
    supabase.from('daily_challenge_responses').select('is_correct').eq('user_id', userId),
    supabase.from('badges').select('*'),
    supabase.from('user_badges').select('badge_id').eq('user_id', userId),
  ])

  const xp = profile?.xp ?? 0
  const streakDays = streak?.current_streak_days ?? 0
  const lessonsCompleted = progress?.length ?? 0
  const dailyTotal = dailyResponses?.length ?? 0
  const dailyCorrect = dailyResponses?.filter(r => r.is_correct).length ?? 0
  const earnedIds = new Set((earnedBadges || []).map((b: any) => b.badge_id))
  const newBadges: any[] = []

  for (const badge of allBadges || []) {
    if (earnedIds.has(badge.id)) continue
    let met = false
    switch (badge.requirement_type) {
      case 'lessons_completed': met = lessonsCompleted >= badge.requirement_value; break
      case 'streak_days':       met = streakDays >= badge.requirement_value; break
      case 'xp_total':          met = xp >= badge.requirement_value; break
      case 'daily_challenges':  met = dailyTotal >= badge.requirement_value; break
      case 'daily_correct':     met = dailyCorrect >= badge.requirement_value; break
    }
    if (met) {
      const { error } = await supabase.from('user_badges').insert({ user_id: userId, badge_id: badge.id })
      if (!error) newBadges.push(badge)
    }
  }

  return newBadges
}

export async function getUserBadges(userId: string) {
  const { data } = await supabase
    .from('user_badges')
    .select('earned_at, badge:badges(id, slug, name, description, icon, color, category)')
    .eq('user_id', userId)
    .order('earned_at', { ascending: false })
  return (data || []) as Array<{ earned_at: string; badge: any }>
}

export async function submitDailyChallenge(params: {
  challengeId: string
  selectedIndex: number
  isCorrect: boolean
  localDate: string
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: new Error('Not signed in'), newStreak: null }

  const { error: responseError } = await supabase.from('daily_challenge_responses').insert({
    user_id: user.id,
    challenge_id: params.challengeId,
    selected_index: params.selectedIndex,
    is_correct: params.isCorrect,
  })

  if (responseError) return { error: responseError, newStreak: null }

  if (params.isCorrect) {
    const sourceId = `daily_${params.challengeId}`
    const { error: logError } = await supabase
      .from('learning_xp_log')
      .insert({ user_id: user.id, source_id: sourceId, xp_amount: 25 })
    if (!logError) {
      await supabase.rpc('increment_user_xp', { p_user_id: user.id, p_amount: 25 })
    }
  }

  const { data: streak } = await supabase
    .from('learning_user_streaks')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  let currentStreak = 1
  let longestStreak = 1

  if (streak?.last_activity_date) {
    if (streak.last_activity_date === params.localDate) {
      currentStreak = streak.current_streak_days
      longestStreak = streak.longest_streak_days
    } else {
      const lastDate = new Date(`${streak.last_activity_date}T00:00:00`)
      const todayDate = new Date(`${params.localDate}T00:00:00`)
      const dayDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / 86400000)
      currentStreak = dayDiff === 1 ? streak.current_streak_days + 1 : 1
      longestStreak = Math.max(streak.longest_streak_days, currentStreak)
    }
  }

  await supabase.from('learning_user_streaks').upsert(
    {
      user_id: user.id,
      current_streak_days: currentStreak,
      longest_streak_days: longestStreak,
      last_activity_date: params.localDate,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  // Check for new badges (fire and forget)
  checkAndAwardBadges(user.id).catch(() => {})

  return { error: null, newStreak: currentStreak }
}

export async function getDashboardData(): Promise<{
  lessons: LessonWithProgress[]
  streak: LearningUserStreak | null
  xp: number
}> {
  const lessons = await getLessonLibrary()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { lessons, streak: null, xp: 0 }

  const [{ data: streak }, { data: profile }] = await Promise.all([
    supabase.from('learning_user_streaks').select('*').eq('user_id', user.id).maybeSingle(),
    supabase.from('profiles').select('xp').eq('id', user.id).maybeSingle(),
  ])

  return {
    lessons,
    streak: (streak as LearningUserStreak | null) || null,
    xp: profile?.xp ?? 0,
  }
}

