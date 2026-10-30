begin;
alter table public.listings drop constraint listings_category_check;
alter table public.listings add constraint listings_category_check check(category in ('Internship','Hackathon','Event','AI & tech','Build','Research'));
alter table public.listings add column if not exists eligibility text not null default 'Check original source';
alter table public.listings add column if not exists starts_at timestamptz;
alter table public.listings add column if not exists source_name text;
create index if not exists listing_versions_listing on public.listing_versions(listing_id);
create table public.tools (
 id uuid primary key default gen_random_uuid(),slug text not null unique,title text not null,
 category text not null,summary text not null,description text not null,
 source_url text not null unique check(source_url ~ '^https://'),
 pricing text not null default 'Check provider',level text not null default 'Beginner',
 tags text[] not null default '{}',use_examples text[] not null default '{}',limitations text not null default 'Always verify outputs and provider terms.',
 status text not null default 'pending' check(status in ('pending','published','rejected')),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(), verified_at timestamptz
);
create table public.use_cases (
 id uuid primary key default gen_random_uuid(),slug text not null unique,title text not null,
 category text not null,summary text not null,level text not null default 'Beginner',
 duration text not null,tool_slugs text[] not null default '{}',steps jsonb not null default '[]',
 prompt text not null,deliverable text not null,cautions text not null,
 status text not null default 'published' check(status in ('pending','published','rejected')),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table public.learning_tracks (
 id uuid primary key default gen_random_uuid(),slug text not null unique,title text not null,
 summary text not null,level text not null default 'Beginner',duration text not null,modules jsonb not null,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table public.profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '' check(length(display_name)<100),university text not null default '' check(length(university)<200),
 interests text[] not null default '{}',graduation_year integer check(graduation_year between 2000 and 2100),
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table public.bookmarks (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,
 tool_id uuid references public.tools(id) on delete cascade,
 listing_id uuid references public.listings(id) on delete cascade,
 use_case_id uuid references public.use_cases(id) on delete cascade,
 created_at timestamptz not null default now(),check(num_nonnulls(tool_id,listing_id,use_case_id)=1),
 unique(user_id,tool_id),unique(user_id,listing_id),unique(user_id,use_case_id)
);
create index bookmarks_user on public.bookmarks(user_id);
create index bookmarks_tool on public.bookmarks(tool_id);
create index bookmarks_listing on public.bookmarks(listing_id);
create index bookmarks_use_case on public.bookmarks(use_case_id);
create table public.learning_progress (
 user_id uuid not null references auth.users(id) on delete cascade,track_id uuid not null references public.learning_tracks(id) on delete cascade,
 module_index integer not null check(module_index>=0 and module_index<100),completed_at timestamptz not null default now(),primary key(user_id,track_id,module_index)
);
create index learning_progress_track on public.learning_progress(track_id);
create table public.submissions (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,
 title text not null check(length(title) between 3 and 200),source_url text not null check(source_url ~ '^https://'),
 category text not null check(category in ('Tool','Internship','Hackathon','Event','Research','Use case')),notes text not null default '' check(length(notes)<=3000),
 status text not null default 'pending' check(status in ('pending','approved','rejected')),created_at timestamptz not null default now()
);
create index submissions_user on public.submissions(user_id);
create table public.sources (
 id uuid primary key default gen_random_uuid(),name text not null unique,url text not null,method text not null,
 enabled boolean not null default true,last_success_at timestamptz,notes text not null default ''
);
create table public.integration_keys (hash text primary key,name text not null,enabled boolean not null default true,created_at timestamptz not null default now());
alter table public.tools enable row level security;
alter table public.use_cases enable row level security;
alter table public.learning_tracks enable row level security;
alter table public.profiles enable row level security;
alter table public.bookmarks enable row level security;
alter table public.learning_progress enable row level security;
alter table public.submissions enable row level security;
alter table public.sources enable row level security;
alter table public.integration_keys enable row level security;
revoke all on public.tools,public.use_cases,public.learning_tracks,public.profiles,public.bookmarks,public.learning_progress,public.submissions,public.sources,public.integration_keys from anon,authenticated;
grant select on public.tools,public.use_cases,public.learning_tracks,public.sources to anon,authenticated;
grant select,insert,update,delete on public.profiles,public.bookmarks,public.learning_progress to authenticated;
grant select,insert on public.submissions to authenticated;
grant all on public.tools,public.use_cases,public.learning_tracks,public.profiles,public.bookmarks,public.learning_progress,public.submissions,public.sources,public.integration_keys to service_role;
create policy tools_read on public.tools for select to anon,authenticated using(status='published');
create policy cases_read on public.use_cases for select to anon,authenticated using(status='published');
create policy tracks_read on public.learning_tracks for select to anon,authenticated using(true);
create policy sources_read on public.sources for select to anon,authenticated using(enabled);
create policy own_profile on public.profiles for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy own_bookmarks on public.bookmarks for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy own_progress on public.learning_progress for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id and exists(select 1 from public.learning_tracks t where t.id=track_id and module_index<jsonb_array_length(t.modules)));
create policy own_submissions on public.submissions for select to authenticated using((select auth.uid())=user_id);
create policy submit_pending on public.submissions for insert to authenticated with check((select auth.uid())=user_id and status='pending');
-- Admin role is server-controlled Supabase app_metadata, never user_metadata.
grant insert,update,delete on public.tools,public.use_cases,public.listings to authenticated;
grant select,update on public.submissions to authenticated;
create policy admin_tools on public.tools for all to authenticated using((select auth.jwt())->'app_metadata'->>'role'='admin') with check((select auth.jwt())->'app_metadata'->>'role'='admin');
create policy admin_cases on public.use_cases for all to authenticated using((select auth.jwt())->'app_metadata'->>'role'='admin') with check((select auth.jwt())->'app_metadata'->>'role'='admin');
create policy admin_listings on public.listings for all to authenticated using((select auth.jwt())->'app_metadata'->>'role'='admin') with check((select auth.jwt())->'app_metadata'->>'role'='admin');
create policy admin_submissions on public.submissions for all to authenticated using((select auth.jwt())->'app_metadata'->>'role'='admin') with check((select auth.jwt())->'app_metadata'->>'role'='admin');
-- Public aggregate popularity never reveals who saved an item.
create schema if not exists private;
create function private.popularity_counts() returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_object_agg(entity,n),'{}'::jsonb) from (
 select coalesce(tool_id,listing_id,use_case_id)::text as entity,count(*) as n from public.bookmarks group by coalesce(tool_id,listing_id,use_case_id)
 ) s;
$$;
revoke all on function private.popularity_counts() from public;
grant usage on schema private to anon,authenticated;
grant execute on function private.popularity_counts() to anon,authenticated;
create function public.popularity_counts() returns jsonb language sql stable security invoker set search_path='' as $$select private.popularity_counts();$$;
grant execute on function public.popularity_counts() to anon,authenticated;
commit;
