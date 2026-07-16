-- Run this once in your Supabase project's SQL Editor (Dashboard -> SQL Editor -> New query).
-- Creates the table that stores each signed-in user's daily to-do/notes/focus data,
-- with Row Level Security so a user can only ever read or write their own rows.

create table if not exists public.days (
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  tasks jsonb not null default '[]'::jsonb,
  notes text not null default '',
  pomos integer not null default 0,
  resolved boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

alter table public.days enable row level security;

drop policy if exists "Users manage their own days" on public.days;
create policy "Users manage their own days"
  on public.days
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists days_set_updated_at on public.days;
create trigger days_set_updated_at
  before update on public.days
  for each row execute function public.set_updated_at();
