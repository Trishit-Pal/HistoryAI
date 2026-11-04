-- Idempotent on databases where 0001 and 0002 already ran (including live Neon).

-- commitWrite's claim delete removes link rows first, then the claim.
grant delete on supports, contradicts, claims to museum_app;

-- Allow the 'withdrawn' publication state. The inline check from 0001 is auto-named.
alter table exhibits drop constraint if exists exhibits_publication_state_check;
alter table exhibits add constraint exhibits_publication_state_check
  check (publication_state in ('draft', 'provisional', 'proposed', 'canon', 'withdrawn'));
