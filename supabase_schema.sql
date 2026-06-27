-- Run this in the Supabase SQL editor to set up the database

create table subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  color text not null default '#6366f1',
  created_at timestamptz default now()
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  subject_id uuid references subjects(id) on delete set null,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_seconds integer not null,
  note text,
  created_at timestamptz default now()
);

create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  subject_id uuid references subjects(id) on delete cascade,
  period text not null check (period in ('daily', 'weekly')),
  target_seconds integer not null,
  created_at timestamptz default now(),
  unique(user_id, period, subject_id)
);

-- Row Level Security
alter table subjects enable row level security;
alter table sessions enable row level security;
alter table goals enable row level security;

create policy "own subjects" on subjects for all using (auth.uid() = user_id);
create policy "own sessions" on sessions for all using (auth.uid() = user_id);
create policy "own goals" on goals for all using (auth.uid() = user_id);
