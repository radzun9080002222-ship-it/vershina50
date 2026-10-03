create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
create table if not exists public.cleaning_stats_cache (id text primary key, snapshot jsonb not null);
create table if not exists public.cleaning_stats_auth (id text primary key, token_hash text not null);
alter table public.cleaning_stats_cache enable row level security;
alter table public.cleaning_stats_auth enable row level security;
revoke all on public.cleaning_stats_cache, public.cleaning_stats_auth from anon, authenticated;
grant all on public.cleaning_stats_cache, public.cleaning_stats_auth to service_role;
do $$
declare token text;
begin
  if not exists(select 1 from vault.secrets where name = 'cleaning_stats_refresh_token') then
    token := encode(extensions.gen_random_bytes(32), 'hex');
    perform vault.create_secret(token, 'cleaning_stats_refresh_token');
    insert into public.cleaning_stats_auth values ('refresh', encode(extensions.digest(token, 'sha256'), 'hex'));
  end if;
end $$;
-- UTC 05:00 = 08:00 Europe/Moscow. This changes no existing jobs.
select cron.schedule('cleaning-stats-0800-msk', '0 5 * * *', $job$
  select net.http_post(
    url := 'https://apuajxotemukpjheppaz.supabase.co/functions/v1/cleaning-stats',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-stats-token', (select decrypted_secret from vault.decrypted_secrets where name = 'cleaning_stats_refresh_token')),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
$job$);
