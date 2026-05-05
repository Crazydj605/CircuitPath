# Deploy to Vercel - Quick Guide

## Method 1: GitHub + Vercel Dashboard (Recommended)

### 1. Push to GitHub
```bash
cd circuitpath
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/circuitpath.git
git push -u origin main
```

### 2. Deploy on Vercel
1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Click "Add New Project"
4. Import your `circuitpath` repo
5. Framework: Next.js (auto-detected)
6. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GROK_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (e.g., https://circuitpath.vercel.app)
7. Click **Deploy**

### 3. Add Custom Domain (Optional)
1. In Vercel project, go to "Settings" → "Domains"
2. Add your domain: `circuitpath.com`
3. Follow DNS instructions

## Method 2: Vercel CLI

```bash
# Install CLI
npm i -g vercel

# Login
vercel login

# Deploy from project directory
cd circuitpath
vercel

# Follow prompts
# - Set up and deploy? [Y/n] → Y
# - Link to existing project? [y/N] → N
# - What's your project name? [circuitpath]

# For production deployment
vercel --prod
```

## After Deployment Checklist

- [ ] Site loads at your Vercel URL
- [ ] "Get Started" button works
- [ ] Supabase auth works (can sign up)
- [ ] AI tutor responds
- [ ] Circuit simulator runs
- [ ] Pricing shows correctly

## Troubleshooting

**Build Errors:**
- Check if all env vars are set in Vercel
- Ensure `package.json` has Next.js scripts
- Run `npm run build` locally first to test

**404 Errors:**
- Check `next.config.js` is properly configured
- Ensure `app/page.tsx` exists

**Auth Not Working:**
- Verify Supabase URL and anon key are correct
- Check if Supabase project is active

## Environment Variables Template

Copy these into Vercel dashboard:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
GROK_API_KEY=your_grok_api_key_here
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

Done! Your app is live 🚀
