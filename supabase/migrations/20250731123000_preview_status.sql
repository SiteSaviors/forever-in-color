-- Store asynchronous preview generation status while webhooks complete

create table if not exists public.previews_status (
  request_id text primary key,
  prediction_id text,
  status text not null,
  preview_url text,
  error text,
  image_digest text,
  style_id integer,
  style_version text,
  aspect_ratio text,
  quality text,
  watermark boolean,
  cache_allowed boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists previews_status_prediction_idx
  on public.previews_status (prediction_id);

create index if not exists previews_status_status_idx
  on public.previews_status (status);

alter table public.previews_status enable row level security;

drop policy if exists previews_status_service_role_policy on public.previews_status;

create policy previews_status_service_role_policy
  on public.previews_status
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create or replace function public.touch_previews_status()
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

grant execute on function public.touch_previews_status() to service_role;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'trg_touch_previews_status'
  ) then
    create trigger trg_touch_previews_status
      before update on public.previews_status
      for each row
      execute function public.touch_previews_status();
  end if;
end;
$$;
