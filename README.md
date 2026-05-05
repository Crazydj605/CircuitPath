# CircuitPath

A profitable robotics learning platform with interactive lessons, AI tutoring, and circuit simulation.

## Features

- 🤖 **Interactive Circuit Simulator** - Build and test circuits virtually
- 🧠 **AI Tutor (Grok)** - 24/7 personalized help
- 🎮 **Gamification** - XP, levels, badges, streaks
- 💳 **Subscriptions** - Free, Pro ($10/mo or $8/mo yearly), Premium ($24/mo or $22/mo yearly)
- 📱 **Responsive Design** - Works on all devices
- ⚡ **Smooth Animations** - Framer Motion powered

## Tech Stack

- Next.js 14 + TypeScript
- Tailwind CSS
- Framer Motion
- Supabase (Auth + Database)
- Stripe (Payments)
- Grok AI API

## Quick Start

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Open http://localhost:3000
```

## Project Structure

```
circuitpath/
├── app/                 # Next.js app router
├── components/          # React components
├── lib/                 # Utilities & API
├── types/               # TypeScript types
├── supabase/            # Database schema
└── public/              # Static assets
```

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
GROK_API_KEY=your_grok_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Documentation

- `SETUP-GUIDE.md` - Complete setup instructions
- `DEPLOY-VERCEL.md` - Deployment guide

## License

ISC
