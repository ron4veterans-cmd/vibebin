-- ============================================================
-- VibeBin schema — RUN ONE BLOCK AT A TIME
-- In SQL Editor: paste only one block, click Run, then next.
-- When a block fails, note the block number and the full error.
-- ============================================================

-- BLOCK 1: Extension
create extension if not exists "pgcrypto";

-- BLOCK 2: Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  stripe_customer_id text unique,
  subscription_status text not null default 'free',
  subscription_plan text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- BLOCK 3: Prompts table
create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  title text not null,
  content text not null,
  notes text,
  tags text[] not null default '{}'::text[],
  is_agent_config boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- BLOCK 4: Indexes
create index if not exists prompts_user_id_idx on public.prompts (user_id);
create index if not exists prompts_tags_idx on public.prompts using gin (tags);
create index if not exists prompts_updated_at_idx on public.prompts (user_id, updated_at desc);

-- BLOCK 5: Collections
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create index if not exists collections_user_id_idx on public.collections (user_id);

-- BLOCK 6: Collection prompts join
create table if not exists public.collection_prompts (
  collection_id uuid not null references public.collections on delete cascade,
  prompt_id uuid not null references public.prompts on delete cascade,
  primary key (collection_id, prompt_id)
);

-- BLOCK 7: Enable RLS
alter table public.profiles enable row level security;
alter table public.prompts enable row level security;
alter table public.collections enable row level security;
alter table public.collection_prompts enable row level security;

-- BLOCK 8: Policies (profiles)
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- BLOCK 9: Policies (prompts + collections)
drop policy if exists "Users can CRUD own prompts" on public.prompts;
drop policy if exists "Users can CRUD own collections" on public.collections;
drop policy if exists "Users can manage own collection_prompts" on public.collection_prompts;

create policy "Users can CRUD own prompts"
  on public.prompts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can CRUD own collections"
  on public.collections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own collection_prompts"
  on public.collection_prompts for all
  using (
    exists (
      select 1 from public.collections c
      where c.id = collection_id and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.collections c
      where c.id = collection_id and c.user_id = auth.uid()
    )
  );

-- BLOCK 10: Signup trigger function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- BLOCK 11: Signup trigger
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- BLOCK 12: updated_at function + triggers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists prompts_updated_at on public.prompts;
create trigger prompts_updated_at
  before update on public.prompts
  for each row
  execute function public.set_updated_at();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();
