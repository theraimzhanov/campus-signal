-- Already applied to the hosted project; run after platform.sql for a fresh installation.
alter table public.listings add column if not exists ends_at timestamptz;
create or replace function public.expire_listings() returns bigint language plpgsql security invoker set search_path='' as $$
declare affected bigint;
begin update public.listings set status='expired' where status='published' and (deadline<now() or ends_at<now());get diagnostics affected=row_count;return affected;end; $$;
alter policy "Public reads current published listings" on public.listings using(status='published' and (deadline is null or deadline>now()) and (ends_at is null or ends_at>now()));
