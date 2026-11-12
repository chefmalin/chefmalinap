-- Secure NutriChef authorization: do not put administrator e-mail addresses in browser code.
-- Apply this migration in the linked Supabase project, then insert administrators
-- only from the Supabase SQL Editor with a privileged account.

create table if not exists public.nutrichef_admins (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.nutrichef_admins enable row level security;

-- One row only: the authenticated user's own access result.
-- SECURITY DEFINER is intentional: callers cannot read the admin allowlist.
create or replace function public.nutrichef_access()
returns table(allowed boolean, access_role text)
language sql
stable
security definer
set search_path = public, auth
as $$
  select true, 'admin'::text
  from public.nutrichef_admins as admin
  where lower(admin.email) = lower(coalesce(auth.jwt() ->> 'email', ''))

  union all

  select true, 'subscriber'::text
  from public.nutrichef_entitlements as entitlement
  where lower(entitlement.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    and entitlement.access_expires_at > now()
    and not exists (
      select 1
      from public.nutrichef_admins as admin
      where lower(admin.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    )

  limit 1;
$$;

revoke all on function public.nutrichef_access() from public, anon;
grant execute on function public.nutrichef_access() to authenticated;
