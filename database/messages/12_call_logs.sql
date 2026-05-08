-- 12_call_logs.sql
-- Stores phone call history for the Comms Hub

create table if not exists public.call_logs (
  id           uuid primary key default gen_random_uuid(),
  room_id      text not null,
  caller_id    uuid not null references public.profiles(id) on delete cascade,
  callee_id    uuid not null references public.profiles(id) on delete cascade,
  status       text not null default 'missed'  -- 'answered' | 'missed' | 'declined'
                 check (status in ('answered', 'missed', 'declined')),
  duration_sec integer default 0,
  created_at   timestamptz not null default now()
);

-- Index for fast lookup by participant
create index if not exists call_logs_caller_idx on public.call_logs(caller_id);
create index if not exists call_logs_callee_idx on public.call_logs(callee_id);

-- Row-Level Security: users can only see calls they were part of
alter table public.call_logs enable row level security;

create policy "Users see own call logs"
  on public.call_logs for select
  using (auth.uid() = caller_id or auth.uid() = callee_id);

create policy "Caller can insert call log"
  on public.call_logs for insert
  with check (auth.uid() = caller_id);

create policy "Caller can update call log"
  on public.call_logs for update
  using (auth.uid() = caller_id);
