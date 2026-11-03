create table if not exists schema_migrations (
  name text primary key,
  applied_at timestamptz not null default now()
);

create table if not exists exhibits (
  id text primary key,
  era_id text,
  layer text not null check (layer in ('technical', 'context')),
  kind text not null,
  title text not null,
  start_year integer not null,
  end_year integer,
  publication_state text not null check (publication_state in ('draft', 'provisional', 'proposed', 'canon')),
  incomplete boolean not null,
  confidence text check (confidence in ('confirmed', 'reported', 'disputed', 'rumored')),
  official_primary boolean,
  no_predecessor_in_scope boolean,
  public_story text not null,
  technical_account text,
  editorial_note text,
  tags text[] not null default '{}',
  citations jsonb not null default '[]',
  figure jsonb,
  field_change jsonb,
  prose_flags jsonb not null default '[]',
  version integer not null,
  updated_at timestamptz not null
);

create table if not exists claims (
  id text primary key,
  exhibit_id text not null references exhibits (id),
  statement text not null,
  role text not null,
  status text not null,
  publication_state text not null
);

create table if not exists sources (
  id text primary key,
  title text not null,
  year integer not null,
  authors text not null,
  locator text not null check (locator ~ '^https?://'),
  kind text not null
);

create table if not exists supports (
  claim_id text not null references claims (id),
  source_id text not null references sources (id),
  primary key (claim_id, source_id)
);

create table if not exists suggestions (
  id uuid primary key default gen_random_uuid(),
  exhibit_id text not null references exhibits (id),
  kind text not null check (kind in ('correction', 'source')),
  body text not null check (char_length(body) between 20 and 2000),
  source_url text check (source_url is null or source_url ~ '^https?://'),
  ip_hash text not null,
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  resolved_at timestamptz,
  resolved_version integer,
  editor_note text
);

create table if not exists evolution (
  from_id text not null,
  to_id text not null,
  type text not null,
  source_id text,
  note text,
  primary key (from_id, to_id, type)
);

create table if not exists contradicts (
  from_claim_id text not null,
  to_claim_id text not null,
  primary key (from_claim_id, to_claim_id)
);

create table if not exists exhibit_versions (
  exhibit_id text not null references exhibits (id),
  version integer not null,
  at timestamptz not null,
  blob jsonb not null,
  reason text not null,
  suggestion_id uuid references suggestions (id),
  primary key (exhibit_id, version)
);

create table if not exists audits (
  id bigserial primary key,
  at timestamptz not null,
  by_role text not null,
  change text not null
);

create table if not exists rate_events (
  id bigserial primary key,
  bucket text not null,
  key text not null,
  at timestamptz not null default now()
);

create index if not exists rate_events_lookup on rate_events (bucket, key, at);

create or replace function forbid_mutation() returns trigger
language plpgsql as $$
begin
  raise exception 'append-only';
end;
$$;

drop trigger if exists exhibit_versions_append_only on exhibit_versions;
create trigger exhibit_versions_append_only
  before update or delete on exhibit_versions
  for each row execute function forbid_mutation();

drop trigger if exists audits_append_only on audits;
create trigger audits_append_only
  before update or delete on audits
  for each row execute function forbid_mutation();
