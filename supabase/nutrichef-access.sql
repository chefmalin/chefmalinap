-- Accès client NutriChef : une ligne par adresse e-mail acheteuse.
-- L'achat arrive avant la première connexion NutriChef ; l'e-mail est donc la clé.
create table if not exists public.nutrichef_entitlements (
  email text primary key,
  plan text not null check (plan in ('3_months', '6_months', '12_months')),
  access_expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table public.nutrichef_entitlements enable row level security;

create policy "Clients consultent leur droit NutriChef"
on public.nutrichef_entitlements for select
to authenticated
using (lower(email) = lower(auth.jwt() ->> 'email'));
