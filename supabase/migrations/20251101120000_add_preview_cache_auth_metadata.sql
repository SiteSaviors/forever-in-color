-- Add user/tier metadata to preview cache entries

alter table if exists public.preview_cache_entries
  add column if not exists created_by_user_id uuid,
  add column if not exists tier text;

create index if not exists preview_cache_entries_user_idx
  on public.preview_cache_entries (created_by_user_id);

create index if not exists preview_cache_entries_tier_idx
  on public.preview_cache_entries (tier);
