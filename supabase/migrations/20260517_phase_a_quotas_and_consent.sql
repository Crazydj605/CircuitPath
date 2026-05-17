-- CircuitPath Phase A — AI usage tracking + email consent
-- Adds:
--   1. ai_usage_log table for server-side AI Tutor / Code Reviewer quotas
--   2. profiles.email_consent column for future drip campaigns

-- 1. AI usage log ----------------------------------------------------
create table if not exists ai_usage_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('tutor', 'review')),
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_usage_user_day
  on ai_usage_log (user_id, kind, created_at);

alter table ai_usage_log enable row level security;

-- Users can only see their own usage
drop policy if exists "users read own ai usage" on ai_usage_log;
create policy "users read own ai usage" on ai_usage_log
  for select using (auth.uid() = user_id);

-- 2. Email consent on profiles ---------------------------------------
alter table profiles
  add column if not exists email_consent boolean not null default true,
  add column if not exists email_consent_at timestamptz;
