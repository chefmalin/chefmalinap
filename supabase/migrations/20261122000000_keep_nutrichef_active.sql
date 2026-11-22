-- The Cloudflare scheduled request invokes this tiny function every five days.
-- It exposes no customer data and only prevents an idle free Supabase project
-- from being paused before the next client connection.
create or replace function public.nutrichef_keep_alive()
returns boolean
language sql
security definer
set search_path = public
as $$ select true; $$;

revoke all on function public.nutrichef_keep_alive() from public;
grant execute on function public.nutrichef_keep_alive() to anon;
