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
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'anonymous_usage'
      AND policyname = 'anonymous_usage_service_manage'
  ) THEN
    CREATE POLICY anonymous_usage_service_manage
      ON public.anonymous_usage
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END;
$$;
