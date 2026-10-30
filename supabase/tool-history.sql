-- Applied to hosted project. Run after platform.sql on a fresh installation.
create table public.tool_versions(id bigint generated always as identity primary key,tool_id uuid not null references public.tools(id) on delete cascade,recorded_at timestamptz not null default now(),previous_record jsonb not null);
create index tool_versions_tool on public.tool_versions(tool_id);
alter table public.tool_versions enable row level security;
revoke all on public.tool_versions from anon,authenticated;
grant all on public.tool_versions to service_role;
grant usage,select on sequence public.tool_versions_id_seq to service_role;
create function public.archive_tool_version() returns trigger language plpgsql security invoker set search_path='' as $$
begin
if (to_jsonb(old)-'updated_at'-'verified_at') is distinct from (to_jsonb(new)-'updated_at'-'verified_at') then
insert into public.tool_versions(tool_id,previous_record) values(old.id,to_jsonb(old));
end if;new.updated_at=now();return new;end;$$;
create trigger tools_history before update on public.tools for each row execute function public.archive_tool_version();
grant insert on public.tool_versions to authenticated;
create policy admin_tool_history on public.tool_versions for insert to authenticated with check((select auth.jwt())->'app_metadata'->>'role'='admin');
create function public.ingest_tool_candidate(record jsonb) returns uuid language plpgsql security invoker set search_path='' as $$
declare result uuid;
begin
insert into public.tools(slug,title,category,summary,description,source_url,pricing,level,tags,use_examples,status,verified_at)
values(record->>'slug',record->>'title','Open-source AI',record->>'summary','Discovered from official GitHub repository metadata. Review the README, license, maintenance status and hardware requirements before use.',record->>'source_url','Check repository','Intermediate',array['Open source','Review required'],array['Read the official project documentation','Test a small non-sensitive example'],'pending',now())
on conflict(source_url) do update set title=excluded.title,summary=excluded.summary,verified_at=now()
returning id into result;return result;end;$$;
revoke execute on function public.ingest_tool_candidate(jsonb),public.archive_tool_version() from public,anon,authenticated;
grant execute on function public.ingest_tool_candidate(jsonb),public.archive_tool_version() to service_role;
grant execute on function public.archive_tool_version() to authenticated;
