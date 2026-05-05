-- Learning rebuild migration
-- Run in Supabase SQL editor.

create table if not exists learning_lessons (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  summary text not null,
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  estimated_minutes integer not null default 10,
  order_index integer not null default 0,
  required_tier text not null default 'free' check (required_tier in ('free', 'pro', 'max')),
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists learning_lesson_steps (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references learning_lessons(id) on delete cascade,
  step_index integer not null,
  title text not null,
  instruction_md text not null,
  code_snippet text,
  checkpoint_prompt text,
  checkpoint_answer text,
  troubleshooting_md text not null,
  expected_outcome text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (lesson_id, step_index)
);

create table if not exists learning_user_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references learning_lessons(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  current_step_index integer not null default 0,
  completed_steps integer[] not null default '{}',
  started_at timestamptz,
  completed_at timestamptz,
  last_seen_at timestamptz not null default timezone('utc', now()),
  unique (user_id, lesson_id)
);

create table if not exists learning_user_step_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references learning_lessons(id) on delete cascade,
  step_id uuid not null references learning_lesson_steps(id) on delete cascade,
  is_correct boolean not null default false,
  attempt_count integer not null default 0,
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, lesson_id, step_id)
);

create table if not exists learning_user_streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_streak_days integer not null default 0,
  longest_streak_days integer not null default 0,
  last_activity_date date,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists learning_user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  board_type text not null default 'Arduino Uno',
  beginner_tips_enabled boolean not null default true,
  reminder_cadence text not null default 'daily' check (reminder_cadence in ('off', 'daily', 'weekly')),
  notifications_enabled boolean not null default true,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table learning_lessons enable row level security;
alter table learning_lesson_steps enable row level security;
alter table learning_user_lesson_progress enable row level security;
alter table learning_user_step_checks enable row level security;
alter table learning_user_streaks enable row level security;
alter table learning_user_preferences enable row level security;

drop policy if exists "published lessons readable" on learning_lessons;
create policy "published lessons readable"
  on learning_lessons for select
  using (is_published = true);

drop policy if exists "published lesson steps readable" on learning_lesson_steps;
create policy "published lesson steps readable"
  on learning_lesson_steps for select
  using (exists (
    select 1 from learning_lessons l
    where l.id = lesson_id and l.is_published = true
  ));

drop policy if exists "own progress read" on learning_user_lesson_progress;
create policy "own progress read"
  on learning_user_lesson_progress for select
  using (auth.uid() = user_id);

drop policy if exists "own progress write" on learning_user_lesson_progress;
create policy "own progress write"
  on learning_user_lesson_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "own checks read" on learning_user_step_checks;
create policy "own checks read"
  on learning_user_step_checks for select
  using (auth.uid() = user_id);

drop policy if exists "own checks write" on learning_user_step_checks;
create policy "own checks write"
  on learning_user_step_checks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "own streak read" on learning_user_streaks;
create policy "own streak read"
  on learning_user_streaks for select
  using (auth.uid() = user_id);

drop policy if exists "own streak write" on learning_user_streaks;
create policy "own streak write"
  on learning_user_streaks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "own preferences read" on learning_user_preferences;
create policy "own preferences read"
  on learning_user_preferences for select
  using (auth.uid() = user_id);

drop policy if exists "own preferences write" on learning_user_preferences;
create policy "own preferences write"
  on learning_user_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

insert into learning_lessons (slug, title, summary, difficulty, estimated_minutes, order_index, required_tier, is_published)
values
  ('blink-led', 'Blink an LED', 'Learn your first Arduino sketch by blinking an LED safely and confidently.', 'beginner', 20, 1, 'free', true),
  ('button-input', 'Read a Button Input', 'Wire a pushbutton and read its state in Arduino code.', 'beginner', 25, 2, 'pro', true),
  ('pwm-fade-led', 'Fade an LED with PWM', 'Use PWM output to smoothly fade an LED in and out.', 'beginner', 25, 3, 'max', true)
on conflict (slug) do update set
  summary = excluded.summary,
  estimated_minutes = excluded.estimated_minutes,
  required_tier = excluded.required_tier,
  is_published = excluded.is_published;

with blink as (
  select id from learning_lessons where slug = 'blink-led'
),
button as (
  select id from learning_lessons where slug = 'button-input'
),
pwm as (
  select id from learning_lessons where slug = 'pwm-fade-led'
)
insert into learning_lesson_steps (lesson_id, step_index, title, instruction_md, code_snippet, checkpoint_prompt, checkpoint_answer, troubleshooting_md, expected_outcome)
values
  ((select id from blink), 1, 'Gather your parts', 'Get an Arduino Uno, USB cable, one LED, one 220 ohm resistor, a breadboard, and jumper wires.', null, 'Do you have all listed parts?', 'yes', 'If you are missing a resistor, pause here. Do not connect LED directly to 5V.', 'You can identify every part on your desk.'),
  ((select id from blink), 2, 'Wire the LED safely', 'Place the LED on the breadboard. Connect the long leg (anode) through the 220 ohm resistor to digital pin 9. Connect the short leg (cathode) to GND.', null, 'Which LED leg goes to GND?', 'short leg', 'If the LED does not light later, check polarity first. Long leg should face the resistor and pin 9 path.', 'LED and resistor are connected between pin 9 and GND.'),
  ((select id from blink), 3, 'Upload blink code', 'Open Arduino IDE. Select board Arduino Uno and correct COM port. Paste this sketch and upload.', 'void setup() {\n  pinMode(9, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(9, HIGH);\n  delay(1000);\n  digitalWrite(9, LOW);\n  delay(1000);\n}', 'What function runs repeatedly?', 'loop', 'If upload fails, re-check Tools > Board and Tools > Port. Also try a different USB cable.', 'Upload succeeds with no compiler errors.'),
  ((select id from blink), 4, 'Observe and tune', 'Watch the LED blink once per second. Change delay values to 500 to make it faster and upload again.', null, 'Did changing delay make blinking faster?', 'yes', 'If speed did not change, confirm you clicked Upload and the board finished uploading.', 'You can control blink speed confidently.'),

  ((select id from button), 1, 'Wire the pushbutton', 'Place button across breadboard center gap. Use 10k pull-down resistor from pin 2 to GND, and connect button to 5V.', null, 'What does pull-down resistor prevent?', 'floating input', 'If readings are random, your pull-down is likely missing or disconnected.', 'Button input is stable when not pressed.'),
  ((select id from button), 2, 'Read the button in code', 'Upload this sketch and open Serial Monitor at 9600 baud.', 'void setup() {\n  pinMode(2, INPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int buttonState = digitalRead(2);\n  Serial.println(buttonState);\n  delay(100);\n}', 'What value appears when pressed?', '1', 'If serial monitor is blank, verify baud rate 9600 and that Serial Monitor is open.', 'Serial shows 0 when released and 1 when pressed.'),

  ((select id from pwm), 1, 'Use a PWM-capable pin', 'Move your LED circuit to pin 9 (already PWM-capable). Keep resistor in series.', null, 'Is pin 9 PWM-capable?', 'yes', 'If fade is not smooth later, verify you are on pin 9, 10, or 11 on Uno.', 'LED is wired on PWM pin with resistor.'),
  ((select id from pwm), 2, 'Upload fade sketch', 'Upload this PWM fade sketch.', 'void setup() {\n  pinMode(9, OUTPUT);\n}\n\nvoid loop() {\n  for (int b = 0; b <= 255; b++) {\n    analogWrite(9, b);\n    delay(8);\n  }\n  for (int b = 255; b >= 0; b--) {\n    analogWrite(9, b);\n    delay(8);\n  }\n}', 'What PWM value is maximum brightness?', '255', 'If LED only blinks on/off, make sure you used analogWrite on a PWM pin.', 'LED smoothly fades in and out.')
on conflict (lesson_id, step_index) do update set
  title = excluded.title,
  instruction_md = excluded.instruction_md,
  code_snippet = excluded.code_snippet,
  checkpoint_prompt = excluded.checkpoint_prompt,
  checkpoint_answer = excluded.checkpoint_answer,
  troubleshooting_md = excluded.troubleshooting_md,
  expected_outcome = excluded.expected_outcome,
  updated_at = timezone('utc', now());
