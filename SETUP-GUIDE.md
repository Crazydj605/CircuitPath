# CircuitPath Setup Guide - Simple Instructions

## What I Built For You

**CircuitPath** - A profitable robotics learning platform with:
- **Interactive Circuit Simulator** - Users can build and test circuits
- **AI Tutor (Grok)** - 24/7 AI help powered by your API key
- **Gamification** - XP, levels, badges, streaks to keep users addicted
- **Subscription Plans** - Free, Pro ($10/mo or $8/mo yearly), Premium ($24/mo or $22/mo yearly)
- **Smooth Animations** - Framer Motion throughout
- **Sound Effects** - Ready for Web Audio API integration

## Project Structure
```
circuitpath/
├── app/                    # Next.js pages
├── components/             # React components
│   ├── CircuitSimulator.tsx    # Interactive circuit builder
│   ├── AiTutor.tsx             # Grok AI chat widget
│   ├── AuthModal.tsx           # Login/signup
│   ├── GamificationBar.tsx     # XP/Level display
│   ├── LessonCard.tsx          # Lesson preview cards
│   ├── Navbar.tsx              # Navigation
│   └── PricingSection.tsx      # Subscription plans
├── lib/                    # Utilities
│   ├── supabase.ts         # Database/auth
│   └── grok.ts             # AI integration
├── types/                  # TypeScript types
├── supabase/
│   └── schema.sql          # Database setup
└── .env.local              # Your API keys (already set)
```

## Step 1: Set Up Supabase (Database + Auth)

### 1. Create Free Supabase Account
1. Go to https://supabase.com
2. Sign up with your email (free tier is plenty)
3. Click "New Project"
4. Name it: `circuitpath`
5. Choose region closest to your users
6. Click "Create"

### 2. Get Your API Keys
1. In your Supabase dashboard, click "Project Settings" (gear icon)
2. Go to "API" in the left menu
3. Copy these values:
   - **URL** (like: `https://xxxxx.supabase.co`)
   - **anon/public** key (long string starting with `eyJ...`)

### 3. Update .env.local
Your `.env.local` file already has placeholder values. Replace them:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
```

### 4. Set Up Database Tables
1. In Supabase, click "SQL Editor" in left sidebar
2. Click "New query"
3. Open `supabase/schema.sql` from this project
4. Copy the entire file contents
5. Paste into SQL Editor
6. Click "Run"

This creates tables for users, lessons, progress, badges, etc.

## Step 2: Test Locally

### Run the App
```bash
cd circuitpath
npm run dev
```

Open http://localhost:3000

### What to Test:
1. ✅ Page loads with animations
2. ✅ "Get Started" button opens auth modal
3. ✅ Can sign up with email/password
4. ✅ AI tutor widget opens (bottom right)
5. ✅ Circuit simulator works
6. ✅ Pricing shows monthly/yearly toggle

## Step 3: Deploy to Vercel

### Option A: One-Click Deploy (Easiest)
1. Push your code to GitHub
2. Go to https://vercel.com
3. Click "Add New Project"
4. Import your GitHub repo
5. Vercel will auto-detect Next.js
6. Add Environment Variables (copy from .env.local)
7. Click Deploy

### Option B: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

### Required Environment Variables in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GROK_API_KEY`
- `NEXT_PUBLIC_APP_URL` (your production URL)

## Step 4: Set Up Stripe (For Payments)

### 1. Create Stripe Account
1. Go to https://stripe.com
2. Sign up (free for testing)
3. Get your API keys from Dashboard

### 2. Add to Environment Variables
```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Create Products & Prices
1. In Stripe Dashboard, go to "Products"
2. Create "Pro Plan" - $10/month ($8/month for yearly)
3. Create "Premium Plan" - $24/month ($22/month for yearly)
4. Copy the Price IDs to your code

### 4. Set Up Webhook
1. In Stripe, go to "Developers" → "Webhooks"
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `invoice.payment_succeeded`, etc.
4. Copy webhook secret to env vars

## You're Done! 🎉

Your app should now be:
- ✅ Running locally at localhost:3000
- ✅ Deployed to Vercel with custom domain
- ✅ Connected to Supabase database
- ✅ Accepting payments via Stripe
- ✅ AI tutor working with Grok

**Need help?** Check the files:
- `DEPLOY-VERCEL.md` - Detailed deployment steps
- `README.md` - Project overview
- `supabase/schema.sql` - Database structure
