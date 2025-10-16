-- Preview cache metadata table and helpers

create table if not exists public.preview_cache_entries (
  cache_key text primary key,
  style_id integer not null,
  style_version text not null,
  image_digest text not null,
  aspect_ratio text not null,
  quality text not null,
  watermark boolean not null default true,
  storage_path text not null,
  preview_url text not null,
  ttl_expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  last_accessed_at timestamptz,
  hit_count integer not null default 1,
  source_request_id text
);

create index if not exists preview_cache_entries_style_lookup_idx
  on public.preview_cache_entries (style_id, aspect_ratio, quality);

create index if not exists preview_cache_entries_digest_idx
  on public.preview_cache_entries (image_digest);

alter table public.preview_cache_entries enable row level security;

drop policy if exists preview_cache_entries_service_role_policy on public.preview_cache_entries;

create policy preview_cache_entries_service_role_policy
  on public.preview_cache_entries
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create or replace function public.increment_preview_cache_hit(p_cache_key text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.preview_cache_entries
     set hit_count = preview_cache_entries.hit_count + 1,
         last_accessed_at = now()
   where cache_key = p_cache_key;
end;
$$;

grant execute on function public.increment_preview_cache_hit(text) to service_role;
