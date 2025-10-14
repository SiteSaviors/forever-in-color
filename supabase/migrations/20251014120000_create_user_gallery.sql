-- User Gallery: Persistent storage for saved previews
-- Users can opt-in to save previews to their gallery for later access

create table if not exists public.user_gallery (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  anon_token text references public.anonymous_tokens(token) on delete cascade,
  preview_log_id uuid references public.preview_logs(id) on delete set null,

  -- Preview metadata
  style_id text not null,
  style_name text not null,
  orientation text not null check (orientation in ('horizontal', 'vertical', 'square')),

  -- Storage URLs
  watermarked_url text not null,
  clean_url text, -- null for free/anonymous users

  -- User actions
  is_favorited boolean not null default false,
  is_deleted boolean not null default false,
  last_downloaded_at timestamptz,
  download_count int not null default 0,

  -- Timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Constraint: must have either user_id or anon_token
  constraint user_gallery_identity_check check (
    (user_id is not null and anon_token is null) or
    (user_id is null and anon_token is not null)
  )
);

-- Indexes for efficient queries
create index if not exists idx_user_gallery_user_created on public.user_gallery(user_id, created_at desc) where user_id is not null and is_deleted = false;
create index if not exists idx_user_gallery_anon_created on public.user_gallery(anon_token, created_at desc) where anon_token is not null and is_deleted = false;
create index if not exists idx_user_gallery_favorites on public.user_gallery(user_id, is_favorited, created_at desc) where is_favorited = true and is_deleted = false;
create index if not exists idx_user_gallery_style on public.user_gallery(style_id) where is_deleted = false;
create index if not exists idx_user_gallery_orientation on public.user_gallery(orientation) where is_deleted = false;

-- Row Level Security
alter table public.user_gallery enable row level security;

-- Users can view their own gallery items
drop policy if exists user_gallery_select_self on public.user_gallery;
create policy user_gallery_select_self
  on public.user_gallery
  for select
  using (
    auth.role() = 'service_role'
    or (auth.uid() is not null and user_id = auth.uid())
  );

-- Users can insert their own gallery items
drop policy if exists user_gallery_insert_self on public.user_gallery;
create policy user_gallery_insert_self
  on public.user_gallery
  for insert
  with check (
    auth.role() = 'service_role'
    or (auth.uid() is not null and user_id = auth.uid())
  );

-- Users can update their own gallery items
drop policy if exists user_gallery_update_self on public.user_gallery;
create policy user_gallery_update_self
  on public.user_gallery
  for update
  using (
    auth.role() = 'service_role'
    or (auth.uid() is not null and user_id = auth.uid())
  );

-- Users can delete their own gallery items
drop policy if exists user_gallery_delete_self on public.user_gallery;
create policy user_gallery_delete_self
  on public.user_gallery
  for delete
  using (
    auth.role() = 'service_role'
    or (auth.uid() is not null and user_id = auth.uid())
  );

-- Service role has full access
drop policy if exists user_gallery_service_manage on public.user_gallery;
create policy user_gallery_service_manage
  on public.user_gallery
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Update timestamp trigger
create or replace function public.touch_user_gallery()
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

grant execute on function public.touch_user_gallery() to service_role;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_touch_user_gallery'
  ) then
    create trigger trg_touch_user_gallery
      before update on public.user_gallery
      for each row
      execute function public.touch_user_gallery();
  end if;
end;
$$;

-- View for gallery stats (useful for analytics)
create or replace view public.v_gallery_stats as
select
  coalesce(user_id::text, anon_token) as identity,
  count(*) filter (where not is_deleted) as total_saved,
  count(*) filter (where is_favorited and not is_deleted) as total_favorited,
  sum(download_count) filter (where not is_deleted) as total_downloads,
  max(created_at) filter (where not is_deleted) as last_saved_at
from public.user_gallery
group by coalesce(user_id::text, anon_token);

grant select on public.v_gallery_stats to authenticated, service_role;
