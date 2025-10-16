alter table if exists public.anonymous_usage
  add column if not exists ip_hash text,
  add column if not exists subnet_hash text,
  add column if not exists anon_token text,
  add column if not exists soft_remaining integer;

create index if not exists idx_anonymous_usage_ip_hash
  on public.anonymous_usage(ip_hash);

create index if not exists idx_anonymous_usage_subnet_hash
  on public.anonymous_usage(subnet_hash);

create index if not exists idx_anonymous_usage_subnet_last_seen
  on public.anonymous_usage(subnet_hash, last_seen desc);
