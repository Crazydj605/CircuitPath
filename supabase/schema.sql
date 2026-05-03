-- CircuitPath Database Schema
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
    subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- User stats table
CREATE TABLE IF NOT EXISTS user_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    streak_days INTEGER DEFAULT 0,
    last_activity_date DATE,
    lessons_completed INTEGER DEFAULT 0,
    total_time_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Badges table
CREATE TABLE IF NOT EXISTS badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    requirement_type TEXT,
    requirement_value INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- User badges (many-to-many)
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, badge_id)
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    category TEXT,
    duration_minutes INTEGER DEFAULT 0,
    xp_reward INTEGER DEFAULT 0,
    required_tier TEXT DEFAULT 'free' CHECK (required_tier IN ('free', 'pro', 'premium')),
    order_index INTEGER DEFAULT 0,
    content JSONB,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    xp_earned INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    quiz_score INTEGER,
    time_spent_minutes INTEGER DEFAULT 0,
    UNIQUE(user_id, lesson_id)
);

-- AI chat history
CREATE TABLE IF NOT EXISTS ai_chat_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    context TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Row Level Security Policies

-- Profiles: Users can read all profiles, but only update their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" 
    ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
    ON profiles FOR UPDATE USING (auth.uid() = id);

-- User stats: Users can only access their own stats
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stats" 
    ON user_stats FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" 
    ON user_stats FOR UPDATE USING (auth.uid() = user_id);

-- User progress: Users can only access their own progress
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" 
    ON user_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" 
    ON user_progress FOR ALL USING (auth.uid() = user_id);

-- Lessons: Everyone can view published lessons
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published lessons are viewable by everyone" 
    ON lessons FOR SELECT USING (is_published = true);

-- Chat history: Users can only access their own chats
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat history" 
    ON ai_chat_history FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat messages" 
    ON ai_chat_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions

-- Update user stats after lesson completion
CREATE OR REPLACE FUNCTION update_user_stats_after_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE user_stats 
        SET 
            total_xp = total_xp + NEW.xp_earned,
            lessons_completed = lessons_completed + 1,
            total_time_minutes = total_time_minutes + NEW.time_spent_minutes,
            updated_at = TIMEZONE('utc', NOW())
        WHERE user_id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lesson_completion_trigger
    AFTER UPDATE ON user_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats_after_completion();

-- Calculate user level based on XP
CREATE OR REPLACE FUNCTION calculate_user_level(user_xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN FLOOR(SQRT(user_xp / 100.0)) + 1;
END;
$$ LANGUAGE plpgsql;

-- Insert sample badges
INSERT INTO badges (name, description, icon, color, requirement_type, requirement_value) VALUES
    ('First Steps', 'Complete your first lesson', '🎯', '#00d4ff', 'lessons', 1),
    ('Quick Learner', 'Complete 5 lessons', '📚', '#00ff88', 'lessons', 5),
    ('Dedicated', 'Complete 25 lessons', '🎓', '#8b5cf6', 'lessons', 25),
    ('On Fire', 'Maintain a 7-day streak', '🔥', '#ffaa00', 'streak', 7),
    ('Unstoppable', 'Maintain a 30-day streak', '⚡', '#ff3366', 'streak', 30),
    ('XP Hunter', 'Earn 1000 XP', '💎', '#8b5cf6', 'xp', 1000),
    ('Circuit Master', 'Earn 5000 XP', '👑', '#ffd700', 'xp', 5000)
ON CONFLICT DO NOTHING;

-- Insert sample lessons
INSERT INTO lessons (title, description, difficulty, category, duration_minutes, xp_reward, required_tier, order_index, content, is_published) VALUES
    (
        'Introduction to Circuits',
        'Learn the basics of electrical circuits and how current flows.',
        'beginner',
        'Basics',
        15,
        50,
        'free',
        1,
        '{
            "introduction": "Welcome to your first lesson! We will explore how electrical circuits work.",
            "steps": [
                {
                    "id": "1",
                    "title": "What is a Circuit?",
                    "content": "An electrical circuit is a path for electric current to flow. It needs three things: a power source, a load (like an LED), and conductive wires.",
                    "is_interactive": false
                },
                {
                    "id": "2",
                    "title": "Build Your First Circuit",
                    "content": "Use the circuit simulator to connect a battery to an LED.",
                    "is_interactive": true,
                    "component_type": "circuit-builder"
                }
            ],
            "quiz": [
                {
                    "id": "1",
                    "question": "What are the three main components of a circuit?",
                    "options": ["Battery, Wire, Switch", "Power source, Load, Conductive path", "LED, Resistor, Capacitor"],
                    "correct_answer": 1,
                    "explanation": "Every circuit needs a power source, something that uses the power (load), and a path for electricity to flow."
                }
            ]
        }'::jsonb,
        true
    ),
    (
        'LED & Resistor Basics',
        'Build your first working circuit with an LED and resistor.',
        'beginner',
        'Components',
        20,
        75,
        'free',
        2,
        '{
            "introduction": "LEDs need current limiting resistors to prevent burning out. Let us learn why!",
            "steps": [
                {
                    "id": "1",
                    "title": "Understanding LEDs",
                    "content": "LEDs (Light Emitting Diodes) only allow current to flow in one direction and need specific voltage."
                }
            ]
        }'::jsonb,
        true
    ),
    (
        'Switches & Control',
        'Learn how switches control the flow of electricity.',
        'intermediate',
        'Control',
        25,
        100,
        'pro',
        3,
        '{
            "introduction": "Switches are fundamental control components in circuits.",
            "steps": [
                {
                    "id": "1",
                    "title": "Types of Switches",
                    "content": "Learn about SPST, SPDT, and pushbutton switches."
                }
            ]
        }'::jsonb,
        true
    )
ON CONFLICT DO NOTHING;
