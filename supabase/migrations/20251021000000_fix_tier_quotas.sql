-- Fix token quotas to match tier specifications
-- Creator: 50, Plus: 250, Pro: 500, Free: 10

-- Create function to set correct quota based on tier
create or replace function public.set_subscription_quota()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Set quota based on tier if not explicitly provided
  if new.tokens_quota = 10 or new.tokens_quota is null then
    case new.tier
      when 'creator' then
        new.tokens_quota := 50;
      when 'plus' then
        new.tokens_quota := 250;
      when 'pro' then
        new.tokens_quota := 500;
      when 'free' then
        new.tokens_quota := 10;
      else
        new.tokens_quota := 10;
    end case;
  end if;

  return new;
end;
$$;

grant execute on function public.set_subscription_quota() to service_role;

-- Create trigger to auto-set quota on insert/update
drop trigger if exists trg_set_subscription_quota on public.subscriptions;
create trigger trg_set_subscription_quota
  before insert or update of tier on public.subscriptions
  for each row
  execute function public.set_subscription_quota();

-- Fix existing Creator accounts
update public.subscriptions
set tokens_quota = 50
where tier = 'creator' and tokens_quota = 10;

-- Fix existing Plus accounts
update public.subscriptions
set tokens_quota = 250
where tier = 'plus' and tokens_quota = 10;

-- Fix existing Pro accounts
update public.subscriptions
set tokens_quota = 500
where tier = 'pro' and tokens_quota = 10;
