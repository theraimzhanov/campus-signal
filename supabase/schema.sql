-- Run once in a NEW Supabase project's SQL editor. No existing projects were modified.
begin;
create table public.listings (
 id uuid primary key default gen_random_uuid(),
 title text not null check(length(title) between 1 and 300),
 organization text not null,
 category text not null check(category in ('Internship','Event','AI & tech','Build','Research')),
 location text not null default 'Unknown', summary text not null,
 source_url text not null unique check(source_url ~ '^https://'),
 tags text[] not null default '{}',
 status text not null default 'pending' check(status in ('pending','published','expired','rejected')),
 deadline timestamptz, verified_at timestamptz,
 published_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 popularity integer not null default 0 check(popularity >= 0)
);
create index listings_discovery on public.listings(status,category,published_at desc);
create table public.listing_versions (
 id bigint generated always as identity primary key,
 listing_id uuid not null references public.listings(id) on delete cascade,
 recorded_at timestamptz not null default now(), previous_record jsonb not null
);
create table public.collection_runs (
 id bigint generated always as identity primary key,
 workflow text not null, result text not null, created_at timestamptz not null default now()
);
alter table public.listings enable row level security;
alter table public.listing_versions enable row level security;
alter table public.collection_runs enable row level security;
revoke all on public.listings,public.listing_versions,public.collection_runs from anon,authenticated;
grant select on public.listings to anon,authenticated;
create policy "Public reads current published listings" on public.listings for select to anon,authenticated using(status='published' and (deadline is null or deadline>now()));
grant all on public.listings,public.listing_versions,public.collection_runs to service_role;
grant usage,select on all sequences in schema public to service_role;
create function public.archive_listing_version() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if (to_jsonb(old)-'updated_at'-'verified_at') is distinct from (to_jsonb(new)-'updated_at'-'verified_at') then
 insert into public.listing_versions(listing_id,previous_record) values(old.id,to_jsonb(old));
 end if;
 new.updated_at=now(); return new;
end; $$;
create trigger listings_history before update on public.listings for each row execute function public.archive_listing_version();
-- Called only by trusted n8n credentials. Repeated URL ingestion is idempotent.
create function public.ingest_listing(record jsonb) returns uuid language plpgsql security invoker set search_path='' as $$
declare result uuid;
begin
 insert into public.listings(title,organization,category,location,summary,source_url,tags,verified_at)
 values(record->>'title',record->>'organization',record->>'category',coalesce(record->>'location','Unknown'),record->>'summary',record->>'source_url',array(select jsonb_array_elements_text(coalesce(record->'tags','[]'))),now())
 on conflict(source_url) do update set title=excluded.title,organization=excluded.organization,location=excluded.location,summary=excluded.summary,tags=excluded.tags,verified_at=now()
 returning id into result;
 return result;
end; $$;
create function public.expire_listings() returns bigint language plpgsql security invoker set search_path='' as $$
declare affected bigint;
begin update public.listings set status='expired' where status='published' and deadline<now();get diagnostics affected=row_count;return affected;end; $$;
revoke execute on function public.ingest_listing(jsonb),public.expire_listings(),public.archive_listing_version() from public,anon,authenticated;
grant execute on function public.ingest_listing(jsonb),public.expire_listings(),public.archive_listing_version() to service_role;
commit;
