-- Tracks anonymous generation usage by device fingerprint to enforce monthly limits

create table if not exists public.anonymous_usage (
  id uuid primary key default gen_random_uuid(),
  fingerprint_hash text not null,
  month_bucket date not null,
  generation_count integer not null default 0,
  ip_address text,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now()
);

create unique index if not exists idx_anonymous_usage_fp_month
  on public.anonymous_usage(fingerprint_hash, month_bucket);

create index if not exists idx_anonymous_usage_month
  on public.anonymous_usage(month_bucket);

alter table public.anonymous_usage enable row level security;

-- Service role has full access; edge functions use service key
create policy if not exists anonymous_usage_service_manage
  on public.anonymous_usage
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
