export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  subscription_tier: 'free' | 'pro' | 'premium'
  created_at: string
  updated_at: string
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
  content: LessonContent
  created_at: string
}

export interface LessonContent {
  introduction: string
  steps: LessonStep[]
  quiz?: QuizQuestion[]
  circuit_data?: CircuitData
}

export interface LessonStep {
  id: string
  title: string
  content: string
  image_url?: string
  is_interactive: boolean
  component_type?: 'circuit-builder' | 'code-editor' | 'simulation'
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation: string
}

export interface CircuitData {
  components: CircuitComponent[]
  connections: CircuitConnection[]
  goal: string
  hints: string[]
}

export interface CircuitComponent {
  id: string
  type: 'battery' | 'led' | 'resistor' | 'switch' | 'motor' | 'sensor' | 'wire'
  x: number
  y: number
  rotation: number
  value?: string
  is_powered?: boolean
}

export interface CircuitConnection {
  from: string
  to: string
  from_port: string
  to_port: string
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

export interface UserStats {
  total_xp: number
  level: number
  streak_days: number
  last_activity_date: string
  lessons_completed: number
  total_time_minutes: number
  badges: Badge[]
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  earned_at: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  xp_reward: number
  requirement_type: 'lessons' | 'streak' | 'xp' | 'circuit_built'
  requirement_value: number
}

export interface AiTutorMessage {
  id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  context?: string
  created_at: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  tier: 'free' | 'pro' | 'premium'
  price_monthly: number
  price_yearly: number
  features: string[]
  stripe_price_id_monthly?: string
  stripe_price_id_yearly?: string
}
