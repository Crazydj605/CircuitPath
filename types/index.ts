export interface User {
  id: string
  email: string
  name: string
  subscription_tier: 'free' | 'pro' | 'premium'
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
  required_tier: 'free' | 'pro' | 'premium'
  order_index: number
  content?: any
  is_published: boolean
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
