-- VibeBin schema for the existing Supabase project "VibeBin Project"
-- https://jxcvnnsrvjvimttmohn.supabase.co
--
-- Fresh, empty project: open the SQL editor and run this whole file once.
-- Safe to run again. Tables, policies, and triggers are created only if missing
-- or replaced in place. No rows are deleted.
--
-- The free-plan prompt cap below (25) must match FREE_PROMPT_LIMIT
-- in src/types/index.ts.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  stripe_customer_id text unique,
  paddle_customer_id text,
  paddle_subscription_id text,
  subscription_status text not null default 'free',
  subscription_plan text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists stripe_customer_id text;
alter table public.profiles add column if not exists paddle_customer_id text;
alter table public.profiles add column if not exists paddle_subscription_id text;
alter table public.profiles add column if not exists subscription_status text not null default 'free';
alter table public.profiles add column if not exists subscription_plan text;
alter table public.profiles add column if not exists current_period_end timestamptz;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_subscription_status_check'
  ) then
    alter table public.profiles
      add constraint profiles_subscription_status_check
      check (subscription_status in ('free', 'active', 'canceled', 'past_due'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'profiles_subscription_plan_check'
  ) then
    alter table public.profiles
      add constraint profiles_subscription_plan_check
      check (subscription_plan is null or subscription_plan in ('monthly', 'yearly'));
  end if;
end $$;

create unique index if not exists profiles_paddle_customer_id_key
  on public.profiles (paddle_customer_id);

create unique index if not exists profiles_paddle_subscription_id_key
  on public.profiles (paddle_subscription_id);

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

create index if not exists prompts_user_id_idx on public.prompts (user_id);
create index if not exists prompts_tags_idx on public.prompts using gin (tags);
create index if not exists prompts_updated_at_idx on public.prompts (user_id, updated_at desc);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create index if not exists collections_user_id_idx on public.collections (user_id);

create table if not exists public.collection_prompts (
  collection_id uuid not null references public.collections on delete cascade,
  prompt_id uuid not null references public.prompts on delete cascade,
  primary key (collection_id, prompt_id)
);

create index if not exists collection_prompts_prompt_id_idx
  on public.collection_prompts (prompt_id);

alter table public.profiles enable row level security;
alter table public.prompts enable row level security;
alter table public.collections enable row level security;
alter table public.collection_prompts enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can CRUD own prompts" on public.prompts;
drop policy if exists "Users can CRUD own collections" on public.collections;
drop policy if exists "Users can manage own collection_prompts" on public.collection_prompts;

create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can CRUD own prompts"
  on public.prompts for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can CRUD own collections"
  on public.collections for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage own collection_prompts"
  on public.collection_prompts for all
  to authenticated
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
    and exists (
      select 1 from public.prompts p
      where p.id = prompt_id and p.user_id = auth.uid()
    )
  );

-- Signed-in users cannot grant themselves Pro. The Paddle webhook uses the
-- service role, which is not subject to this freeze.
create or replace function public.protect_profile_billing()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  jwt_role text;
begin
  jwt_role := coalesce(auth.role(), '');
  if jwt_role in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      new.subscription_status := 'free';
      new.subscription_plan := null;
      new.current_period_end := null;
      new.paddle_customer_id := null;
      new.paddle_subscription_id := null;
      new.stripe_customer_id := null;
    else
      new.subscription_status := old.subscription_status;
      new.subscription_plan := old.subscription_plan;
      new.current_period_end := old.current_period_end;
      new.paddle_customer_id := old.paddle_customer_id;
      new.paddle_subscription_id := old.paddle_subscription_id;
      new.stripe_customer_id := old.stripe_customer_id;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_billing on public.profiles;
create trigger profiles_protect_billing
  before insert or update on public.profiles
  for each row
  execute function public.protect_profile_billing();

-- Keep the free plan at 25 prompts even if the client check is skipped.
create or replace function public.enforce_free_prompt_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  status text;
  prompt_count integer;
begin
  select subscription_status into status
  from public.profiles
  where id = new.user_id;

  if status = 'active' then
    return new;
  end if;

  select count(*) into prompt_count
  from public.prompts
  where user_id = new.user_id;

  if prompt_count >= 25 then
    raise exception 'FREE_LIMIT_REACHED' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists prompts_enforce_free_limit on public.prompts;
create trigger prompts_enforce_free_limit
  before insert on public.prompts
  for each row
  execute function public.enforce_free_prompt_limit();

create or replace function public.enforce_pro_collection()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  status text;
begin
  select subscription_status into status
  from public.profiles
  where id = new.user_id;

  if status is distinct from 'active' then
    raise exception 'PRO_REQUIRED' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists collections_enforce_pro on public.collections;
create trigger collections_enforce_pro
  before insert on public.collections
  for each row
  execute function public.enforce_pro_collection();

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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
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

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.prompts from anon, authenticated;
revoke all on table public.collections from anon, authenticated;
revoke all on table public.collection_prompts from anon, authenticated;

grant select, insert on table public.profiles to authenticated;
grant update (email) on table public.profiles to authenticated;
grant select, insert, update, delete on table public.prompts to authenticated;
grant select, insert, update, delete on table public.collections to authenticated;
grant select, insert, update, delete on table public.collection_prompts to authenticated;

grant all on table public.profiles to service_role;
grant all on table public.prompts to service_role;
grant all on table public.collections to service_role;
grant all on table public.collection_prompts to service_role;
