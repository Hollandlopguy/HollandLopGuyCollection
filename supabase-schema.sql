create table if not exists public.cards (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cards enable row level security;
alter table public.posts enable row level security;

drop policy if exists "Public can read cards" on public.cards;
drop policy if exists "Public can read posts" on public.posts;
drop policy if exists "Anyone with anon key can manage cards" on public.cards;
drop policy if exists "Anyone with anon key can manage posts" on public.posts;

create policy "Public can read cards"
on public.cards for select
to anon
using (true);

create policy "Public can read posts"
on public.posts for select
to anon
using (true);

create policy "Anyone with anon key can manage cards"
on public.cards for all
to anon
using (true)
with check (true);

create policy "Anyone with anon key can manage posts"
on public.posts for all
to anon
using (true)
with check (true);
