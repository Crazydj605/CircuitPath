# CircuitPath

A profitable, gamified robotics learning platform with AI tutoring. Built with Next.js, Supabase, Stripe, and Grok AI.

## Features

- **Interactive Circuit Simulator** - Build and test circuits virtually
- **AI Tutor (Grok)** - 24/7 personalized robotics tutoring
- **Gamification** - XP, levels, badges, and streaks
- **Subscription Plans** - Free, Pro ($9.99/mo), Premium ($19.99/mo)
- **Progress Tracking** - Comprehensive learning analytics
- **Structured Lessons** - Better than YouTube tutorials

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Animation**: Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth)
- **AI**: Grok (X.AI) API
- **Payments**: Stripe
- **Deployment**: Vercel

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables** in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   GROK_API_KEY=your_grok_key
   STRIPE_SECRET_KEY=your_stripe_secret
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open** http://localhost:3000

## Database Setup (Supabase)

Run the SQL in `supabase/schema.sql` to create tables:
- profiles
- lessons
- user_progress
- subscriptions

## Deployment

The app is configured for easy deployment to Vercel with GitHub integration.

## Monetization Strategy

- **Free Tier**: 5 lessons, basic simulator, limited AI
- **Pro Tier**: All lessons, unlimited AI, advanced features
- **Premium Tier**: 1-on-1 mentoring, certification, hardware discounts

## License

MIT
