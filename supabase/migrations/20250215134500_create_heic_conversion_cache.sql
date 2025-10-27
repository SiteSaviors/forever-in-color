-- HEIC conversion cache metadata

create table if not exists public.heic_conversion_cache (
  hash text primary key,
  bucket text not null default 'preview-cache',
  storage_path text not null,
  width integer not null,
  height integer not null,
  byte_size bigint not null,
  content_type text not null default 'image/jpeg',
  created_at timestamptz not null default now(),
  last_accessed_at timestamptz not null default now(),
  expires_at timestamptz not null,
  hit_count integer not null default 1
);

create index if not exists heic_conversion_cache_expires_idx
  on public.heic_conversion_cache (expires_at);

alter table public.heic_conversion_cache enable row level security;

drop policy if exists heic_conversion_cache_service_role_policy on public.heic_conversion_cache;

create policy heic_conversion_cache_service_role_policy
  on public.heic_conversion_cache
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

