-- Wondertone entitlements & billing schema

do $$
begin
  if not exists (select 1 from pg_type where typname = 'subscription_tier') then
    create type public.subscription_tier as enum ('free', 'creator', 'plus', 'pro');
  end if;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text,
  dev_override boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  tier public.subscription_tier not null default 'free',
  current_period_start timestamptz,
  current_period_end timestamptz,
  tokens_quota integer not null default 10,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.anonymous_tokens (
  token text primary key,
  free_tokens_remaining integer not null default 5,
  dismissed_prompt boolean not null default false,
  ip_ua_hash text,
  month_bucket date not null default (date_trunc('month', timezone('utc', now()))::date),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.preview_logs (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text unique not null,
  user_id uuid,
  anon_token text,
  tier public.subscription_tier,
  style_id text not null,
  orientation text,
  watermark boolean not null default true,
  priority text,
  outcome text not null default 'pending',
  error_code text,
  preview_url text,
  requires_watermark boolean not null default true,
  tokens_spent integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists preview_logs_user_idx on public.preview_logs (user_id, created_at);
create index if not exists preview_logs_anon_idx on public.preview_logs (anon_token, created_at);
create index if not exists preview_logs_outcome_idx on public.preview_logs (outcome);

create index if not exists subscriptions_period_idx on public.subscriptions (current_period_end);

alter table public.preview_logs
  drop constraint if exists preview_logs_user_id_fkey;

alter table public.preview_logs
  add constraint preview_logs_user_id_fkey
    foreign key (user_id)
    references auth.users(id)
    on delete set null;

alter table public.preview_logs
  drop constraint if exists preview_logs_anon_token_fkey;

alter table public.preview_logs
  add constraint preview_logs_anon_token_fkey
    foreign key (anon_token)
    references public.anonymous_tokens(token)
    on delete set null;

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.anonymous_tokens enable row level security;
alter table public.preview_logs enable row level security;

drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self
  on public.profiles
  for select
  using (auth.uid() = id or auth.role() = 'service_role');

drop policy if exists profiles_service_manage on public.profiles;
create policy profiles_service_manage
  on public.profiles
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists subscriptions_select_self on public.subscriptions;
create policy subscriptions_select_self
  on public.subscriptions
  for select
  using (auth.uid() = user_id or auth.role() = 'service_role');

drop policy if exists subscriptions_service_manage on public.subscriptions;
create policy subscriptions_service_manage
  on public.subscriptions
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists preview_logs_select_self on public.preview_logs;
create policy preview_logs_select_self
  on public.preview_logs
  for select
  using (
    auth.role() = 'service_role'
    or (auth.uid() is not null and user_id = auth.uid())
  );

drop policy if exists preview_logs_service_manage on public.preview_logs;
create policy preview_logs_service_manage
  on public.preview_logs
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

drop policy if exists anonymous_tokens_service_only on public.anonymous_tokens;
create policy anonymous_tokens_service_only
  on public.anonymous_tokens
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create or replace function public.touch_profiles()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.touch_subscriptions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.touch_anonymous_tokens()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.touch_preview_logs()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

grant execute on function public.touch_profiles() to service_role;
grant execute on function public.touch_subscriptions() to service_role;
grant execute on function public.touch_anonymous_tokens() to service_role;
grant execute on function public.touch_preview_logs() to service_role;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_touch_profiles'
  ) then
    create trigger trg_touch_profiles
      before update on public.profiles
      for each row
      execute function public.touch_profiles();
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_touch_subscriptions'
  ) then
    create trigger trg_touch_subscriptions
      before update on public.subscriptions
      for each row
      execute function public.touch_subscriptions();
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_touch_anonymous_tokens'
  ) then
    create trigger trg_touch_anonymous_tokens
      before update on public.anonymous_tokens
      for each row
      execute function public.touch_anonymous_tokens();
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_touch_preview_logs'
  ) then
    create trigger trg_touch_preview_logs
      before update on public.preview_logs
      for each row
      execute function public.touch_preview_logs();
  end if;
end;
$$;

create or replace view public.v_entitlements as
with base as (
  select
    p.id as user_id,
    p.dev_override,
    coalesce(s.tier, 'free'::public.subscription_tier) as tier,
    coalesce(s.tokens_quota, 10) as tokens_quota,
    coalesce(s.current_period_start, date_trunc('month', timezone('utc', now()))) as period_start,
    coalesce(s.current_period_end, (date_trunc('month', timezone('utc', now())) + interval '1 month')) as period_end
  from public.profiles p
  left join public.subscriptions s on s.user_id = p.id
)
select
  b.user_id,
  b.tier,
  b.tokens_quota,
  greatest(
    b.tokens_quota -
    coalesce(sum(pl.tokens_spent) filter (
      where pl.user_id = b.user_id
        and pl.outcome = 'success'
        and pl.created_at >= b.period_start
        and pl.created_at < b.period_end
    ), 0),
    0
  ) as remaining_tokens,
  b.period_start,
  b.period_end,
  b.dev_override
from base b
left join public.preview_logs pl on pl.user_id = b.user_id
group by b.user_id, b.tier, b.tokens_quota, b.period_start, b.period_end, b.dev_override;

grant select on public.v_entitlements to authenticated, service_role;
