export interface User {
  id: string
  email: string
  name: string
  subscription_tier: 'free' | 'pro' | 'premium' | 'max'
  subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due'
  created_at: string
}

export interface UserStats {
  total_xp: number
  level: number
  streak_days: number
  last_activity_date: string
  lessons_completed: number
  total_time_minutes: number
}

export interface Lesson {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string
  duration_minutes: number
  xp_reward: number
  required_tier: 'free' | 'pro' | 'premium' | 'max'
  order_index: number
  content?: any
  is_published: boolean
}

export interface LearningLesson {
  id: string
  slug: string
  title: string
  summary: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimated_minutes: number
  order_index: number
  required_tier: 'free' | 'pro' | 'max'
  is_published: boolean
}

export interface LearningLessonStep {
  id: string
  lesson_id: string
  step_index: number
  title: string
  instruction_md: string
  code_snippet: string | null
  checkpoint_prompt: string | null
  checkpoint_answer: string | null
  troubleshooting_md: string
  expected_outcome: string
}

export interface LearningUserLessonProgress {
  user_id: string
  lesson_id: string
  status: 'not_started' | 'in_progress' | 'completed'
  current_step_index: number
  completed_steps: number[]
  started_at: string | null
  completed_at: string | null
  last_seen_at: string
}

export interface LearningUserStreak {
  user_id: string
  current_streak_days: number
  longest_streak_days: number
  last_activity_date: string | null
}

export interface UserProgress {
  id: string
  user_id: string
  lesson_id: string
  status: 'not_started' | 'in_progress' | 'completed'
  xp_earned: number
  completed_at?: string
  started_at: string
  quiz_score?: number
  time_spent_minutes: number
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  requirement_type: string
  requirement_value: number
}

export interface ChatMessage {
  id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  context?: string
  created_at: string
}
