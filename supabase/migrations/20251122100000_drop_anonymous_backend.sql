-- Drop legacy anonymous support artifacts now that Wondertone requires authenticated sessions.

begin;

-- Remove dependent view before altering user_gallery columns.
drop view if exists public.v_gallery_stats;

-- Drop indexes that reference anon_token columns.
drop index if exists public.preview_logs_anon_idx;
drop index if exists public.idx_user_gallery_anon_created;

-- Drop foreign key and constraint references to anon_token.
alter table if exists public.preview_logs
  drop constraint if exists preview_logs_anon_token_fkey;

alter table if exists public.user_gallery
  drop constraint if exists user_gallery_identity_check;

-- Remove anon_token columns.
alter table if exists public.preview_logs
  drop column if exists anon_token;

alter table if exists public.user_gallery
  drop column if exists anon_token;

-- Enforce authenticated ownership of gallery entries.
alter table if exists public.user_gallery
  alter column user_id set not null;

-- Recreate gallery stats view without anonymous identity fallbacks.
create or replace view public.v_gallery_stats as
select
  user_id::text as identity,
  count(*) filter (where not is_deleted) as total_saved,
  count(*) filter (where is_favorited and not is_deleted) as total_favorited,
  sum(download_count) filter (where not is_deleted) as total_downloads,
  max(created_at) filter (where not is_deleted) as last_saved_at
from public.user_gallery
group by user_id;

grant select on public.v_gallery_stats to authenticated, service_role;

-- Retire anonymous tracking tables and helpers.
drop table if exists public.anonymous_usage;
drop table if exists public.anonymous_tokens;
drop function if exists public.touch_anonymous_tokens();

commit;
