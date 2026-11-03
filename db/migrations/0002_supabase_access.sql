-- Run once in the Supabase SQL editor after 0001.
-- Then set a password that never enters git:
--   alter role museum_app with login password 'choose-a-long-password';
-- Connect the app as museum_app.<project-ref> on the transaction pooler (port 6543).

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'museum_app') then
    create role museum_app nologin;
  end if;
end
$$;

grant usage on schema public to museum_app;
grant select, insert, update on
  exhibits, claims, sources, supports, evolution, contradicts, suggestions
  to museum_app;
grant select, insert on exhibit_versions, audits, rate_events to museum_app;
grant delete on rate_events to museum_app;
grant usage, select on all sequences in schema public to museum_app;

alter table exhibits enable row level security;
alter table claims enable row level security;
alter table sources enable row level security;
alter table supports enable row level security;
alter table evolution enable row level security;
alter table contradicts enable row level security;
alter table exhibit_versions enable row level security;
alter table audits enable row level security;
alter table suggestions enable row level security;
alter table rate_events enable row level security;
alter table schema_migrations enable row level security;

revoke all on all tables in schema public from anon, authenticated;

do $$
declare
  target text;
begin
  foreach target in array array[
    'exhibits', 'claims', 'sources', 'supports', 'evolution', 'contradicts',
    'exhibit_versions', 'audits', 'suggestions', 'rate_events', 'schema_migrations'
  ]
  loop
    execute format('drop policy if exists museum_app_all on %I', target);
    execute format(
      'create policy museum_app_all on %I for all to museum_app using (true) with check (true)',
      target
    );
  end loop;
end
$$;
