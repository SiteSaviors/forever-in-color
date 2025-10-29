-- Extend preview_logs with source metadata to support Gallery Quickview rehydration.

alter table if exists public.preview_logs
  add column if not exists source_storage_path text;

comment on column public.preview_logs.source_storage_path is
  'Storage path of the original user upload (e.g., user_uploads/<user>/<file>).';

alter table if exists public.preview_logs
  add column if not exists source_display_url text;

comment on column public.preview_logs.source_display_url is
  'Publicly accessible URL for the original user upload when available.';

alter table if exists public.preview_logs
  add column if not exists crop_config jsonb;

comment on column public.preview_logs.crop_config is
  'JSON payload capturing crop metadata (x, y, width, height, orientation).';

-- Optional: index for faster lookups when joining preview_logs from gallery items.
create index if not exists preview_logs_source_storage_path_idx
  on public.preview_logs (source_storage_path);

-- Store lightweight gallery thumbnails for quickview strip.
alter table if exists public.user_gallery
  add column if not exists thumbnail_storage_path text;

comment on column public.user_gallery.thumbnail_storage_path is
  'Storage path of the generated thumbnail used by Gallery Quickview.';

create index if not exists user_gallery_thumbnail_storage_path_idx
  on public.user_gallery (thumbnail_storage_path)
  where thumbnail_storage_path is not null;
