-- Shared with Awake&Align mobile: subscription entitlement SSOT (`user_entitlements`).
-- Safe to apply if migrations from the mobile repo already ran (IF NOT EXISTS / DO blocks).

create table if not exists public.user_entitlements (
  user_id uuid primary key references auth.users (id) on delete cascade,
  is_subscriber boolean not null default false,
  provider text not null default 'stripe' check (provider in ('stripe', 'iap')),
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_entitlements_stripe_customer_id_idx
  on public.user_entitlements (stripe_customer_id);
create index if not exists user_entitlements_stripe_subscription_id_idx
  on public.user_entitlements (stripe_subscription_id);

alter table public.user_entitlements enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_entitlements'
      and policyname = 'read_own_entitlements'
  ) then
    create policy read_own_entitlements
      on public.user_entitlements
      for select
      to authenticated
      using (user_id = auth.uid());
  end if;
end
$$;

create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_entitlements_updated_at on public.user_entitlements;
create trigger set_user_entitlements_updated_at
before update on public.user_entitlements
for each row
execute function public.tg_set_updated_at();

alter table public.user_entitlements drop constraint if exists user_entitlements_provider_check;

alter table public.user_entitlements
  add constraint user_entitlements_provider_check
  check (provider in ('stripe', 'iap', 'comp'));
