-- CircuitPath Phase B + C: engagement features + Max-only differentiation
-- Adds:
--   1. simulator_designs + simulator_sessions    (Phase C — sandbox)
--   2. streak freezes on learning_user_streaks   (Phase C — retention)
--   3. public profile slug on profiles            (Phase B — Max portfolio)
--   4. workshop_projects table                    (Phase B — Max-only library)
--   5. max_only_until on learning_lessons         (Phase B — early access)
--   6. Max-only badges                            (Phase B — status)

-- 1. Simulator -------------------------------------------------------
create table if not exists simulator_designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  wokwi_url text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_sim_designs_user on simulator_designs (user_id, created_at desc);

alter table simulator_designs enable row level security;
drop policy if exists "users manage own designs" on simulator_designs;
create policy "users manage own designs" on simulator_designs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists simulator_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists idx_sim_sessions_user_day on simulator_sessions (user_id, created_at);

alter table simulator_sessions enable row level security;
drop policy if exists "users read own sim sessions" on simulator_sessions;
create policy "users read own sim sessions" on simulator_sessions
  for select using (auth.uid() = user_id);

-- 2. Streak freezes -------------------------------------------------
alter table learning_user_streaks
  add column if not exists freezes_available integer not null default 0,
  add column if not exists freezes_earned_total integer not null default 0;

-- 3. Public profile slug --------------------------------------------
alter table profiles
  add column if not exists public_slug text,
  add column if not exists public_profile_enabled boolean not null default false;

-- Backfill public_slug for users who don't have one (lowercase email prefix + short uid)
update profiles
set public_slug = lower(regexp_replace(coalesce(split_part(email, '@', 1), id::text), '[^a-z0-9]', '', 'g')) || substr(id::text, 1, 4)
where public_slug is null;

create unique index if not exists ux_profiles_public_slug on profiles (public_slug);

-- 4. Workshop projects (Max-only curated library) -------------------
create table if not exists workshop_projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  blurb text not null,
  description_md text,
  wokwi_url text not null,
  difficulty text not null check (difficulty in ('beginner','intermediate','advanced')),
  estimated_minutes integer,
  components text[],
  thumbnail_url text,
  order_index integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_workshop_published on workshop_projects (is_published, order_index);

alter table workshop_projects enable row level security;
-- Public read; gating is done at the route layer (Max-only).
drop policy if exists "anyone reads workshop" on workshop_projects;
create policy "anyone reads workshop" on workshop_projects
  for select using (is_published = true);

-- Seed a few starter projects so the page is not empty on launch.
insert into workshop_projects (slug, title, blurb, wokwi_url, difficulty, estimated_minutes, components, order_index)
values
  ('rc-car-bluetooth',  'Bluetooth RC Car',    'Drive two motors from your phone over HC-05 Bluetooth — full WASD control with the L298N driver.', 'https://wokwi.com/projects/new/arduino-uno', 'advanced',     90, ARRAY['Arduino Uno','HC-05','L298N','2x DC motors','Battery pack'], 10),
  ('weather-station',   'OLED Weather Station','DHT11 temperature + humidity + light level on a 128x64 OLED. Live updates, smooth UI.',          'https://wokwi.com/projects/new/arduino-uno', 'intermediate', 60, ARRAY['Arduino Uno','DHT11','SSD1306 OLED','LDR'], 20),
  ('led-matrix-clock',  '8x8 LED Matrix Clock','Scrolling digital clock on a MAX7219 8x8 LED matrix. Reads time from a DS3231 RTC.',             'https://wokwi.com/projects/new/arduino-uno', 'intermediate', 50, ARRAY['Arduino Uno','MAX7219 8x8 LED matrix','DS3231 RTC'], 30),
  ('keypad-lock',       'Keypad Door Lock',    'Enter a 4-digit PIN on a 4x4 matrix keypad. Right code: green LED + servo unlocks. Wrong: red LED.', 'https://wokwi.com/projects/new/arduino-uno', 'intermediate', 45, ARRAY['Arduino Uno','4x4 Keypad','Servo','2x LED'],     40),
  ('reaction-game',     'Reaction-Time Game',  'Random delay, LED lights up, hit the button as fast as you can. Score in milliseconds on an OLED.', 'https://wokwi.com/projects/new/arduino-uno', 'beginner',     30, ARRAY['Arduino Uno','OLED','Pushbutton','LED'], 50),
  ('neopixel-mood',     'NeoPixel Mood Lamp',  'Four buttons cross-fade a NeoPixel ring between mood presets. Smooth HSV transitions.',            'https://wokwi.com/projects/new/arduino-uno', 'beginner',     40, ARRAY['Arduino Uno','WS2812 NeoPixel ring','4x button'], 60)
on conflict do nothing;

-- 5. Early-access window for new lessons ----------------------------
alter table learning_lessons
  add column if not exists max_only_until timestamptz;
-- New lessons can be created with max_only_until = now() + interval '7 days'
-- to keep them Max-only for the first week.

-- 6. Max-only badges -------------------------------------------------
create unique index if not exists ux_badges_slug on badges (slug);

insert into badges (slug, name, description, icon, color, category, requirement_type, requirement_value)
select v.slug, v.name, v.description, v.icon, v.color, v.category, v.requirement_type, v.requirement_value
from (values
  ('max_member',     'Max Member',         'Subscribed to CircuitPath Max',         '👑',  '#a855f7', 'max', 'subscription_tier', 0),
  ('workshop_starter','Workshop Apprentice','Opened your first Workshop project',   '🛠️', '#a855f7', 'max', 'workshop_opens',    1),
  ('workshop_pro',   'Workshop Pro',       'Tried 5 different Workshop projects',   '🏗️', '#a855f7', 'max', 'workshop_opens',    5),
  ('simulator_savant','Simulator Savant',  'Saved 5 simulator designs',             '💾',  '#0ea5e9', 'creator', 'simulator_saves', 5),
  ('streak_guardian','Streak Guardian',    'Used a streak freeze',                  '🛡️', '#10b981', 'streak', 'freeze_used',     1)
) as v(slug, name, description, icon, color, category, requirement_type, requirement_value)
where not exists (select 1 from badges b where b.slug = v.slug);
