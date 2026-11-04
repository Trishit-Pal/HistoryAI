import type { Db } from "./pg";
import type { Role, Violation } from "../domain/types";
import {
  MemoryStore,
  type ChangelogLine,
  type ClaimWrite,
  type EvolutionLink,
  type ExhibitWrite,
  type MuseumSnapshot,
  type SourceWrite,
  type SupportLink,
  type VersionRecord,
  type Write,
} from "../store/memory";

type Row = Record<string, unknown>;

class CommitRejected extends Error {
  constructor(readonly violations: Violation[]) {
    super("rejected");
  }
}

function iso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString();
}

function json<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "string") return JSON.parse(value) as T;
  return value as T;
}

function exhibitFrom(row: Row): MuseumSnapshot["exhibits"][number] {
  return {
    id: String(row.id),
    title: String(row.title),
    kind: row.kind as ExhibitWrite["kind"],
    startYear: Number(row.start_year),
    endYear: row.end_year == null ? undefined : Number(row.end_year),
    publicStory: String(row.public_story),
    technicalAccount: row.technical_account == null ? undefined : String(row.technical_account),
    publicationState: row.publication_state as ExhibitWrite["publicationState"],
    incomplete: Boolean(row.incomplete),
    noPredecessorInScope: row.no_predecessor_in_scope == null ? undefined : Boolean(row.no_predecessor_in_scope),
    layer: (row.layer as "technical" | "context") ?? "technical",
    eraId: row.era_id == null ? undefined : (row.era_id as ExhibitWrite["eraId"]),
    confidence: row.confidence == null ? undefined : (row.confidence as ExhibitWrite["confidence"]),
    citations: json(row.citations, []),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    editorialNote: row.editorial_note == null ? undefined : String(row.editorial_note),
    officialPrimary: row.official_primary == null ? undefined : Boolean(row.official_primary),
    figure: row.figure == null ? undefined : json(row.figure, undefined),
    fieldChange: row.field_change == null ? undefined : json(row.field_change, undefined),
    proseFlags: json(row.prose_flags, []),
    updatedAt: iso(row.updated_at),
    version: Number(row.version),
  };
}

function claimFrom(row: Row): ClaimWrite {
  return {
    id: String(row.id),
    exhibitId: String(row.exhibit_id),
    statement: String(row.statement),
    role: row.role as ClaimWrite["role"],
    status: row.status as ClaimWrite["status"],
    publicationState: row.publication_state as ClaimWrite["publicationState"],
  };
}

function sourceFrom(row: Row): SourceWrite {
  return {
    id: String(row.id),
    title: String(row.title),
    year: Number(row.year),
    authors: String(row.authors),
    locator: String(row.locator),
    kind: row.kind as SourceWrite["kind"],
  };
}

function supportFrom(row: Row): SupportLink {
  return { claimId: String(row.claim_id), sourceId: String(row.source_id) };
}

function evolutionFrom(row: Row): EvolutionLink {
  return {
    type: row.type as EvolutionLink["type"],
    fromId: String(row.from_id),
    toId: String(row.to_id),
    sourceId: row.source_id == null ? undefined : String(row.source_id),
    note: row.note == null ? undefined : String(row.note),
  };
}

/** Only the rows validateWrite and commit read for this write, so a save does not scan the museum. */
async function loadWriteScope(database: Db, write: Write): Promise<MuseumSnapshot> {
  const touchedClaimIds = [write.deleteClaimId, write.retractClaimId].filter((id): id is string => Boolean(id));
  const touchedClaims = touchedClaimIds.length
    ? await database.query<Row>("select * from claims where id = any($1::text[])", [touchedClaimIds])
    : [];
  const exhibitIds = [
    ...new Set([
      ...(write.exhibit ? [write.exhibit.id] : []),
      ...(write.evolution ?? []).filter((link) => link.type === "EVALUATED_ON").map((link) => link.toId),
      ...touchedClaims.map((row) => String(row.exhibit_id)),
    ]),
  ];
  const exhibits = exhibitIds.length
    ? (await database.query<Row>("select * from exhibits where id = any($1::text[])", [exhibitIds])).map(exhibitFrom)
    : [];
  const claims = write.exhibit
    ? await database.query<Row>("select * from claims where exhibit_id = $1", [write.exhibit.id])
    : [];
  const claimIds = [...new Set([...claims, ...touchedClaims].map((row) => String(row.id)))];
  const supports = claimIds.length
    ? await database.query<Row>("select * from supports where claim_id = any($1::text[])", [claimIds])
    : [];
  const sourceIds = [
    ...new Set([
      ...supports.map((row) => String(row.source_id)),
      ...(write.supports ?? []).map((link) => link.sourceId),
      ...(write.evolution ?? []).flatMap((link) => (link.sourceId ? [link.sourceId] : [])),
    ]),
  ];
  const sources = sourceIds.length
    ? await database.query<Row>("select * from sources where id = any($1::text[])", [sourceIds])
    : [];
  const evolution = write.exhibit
    ? await database.query<Row>("select * from evolution where from_id = $1 or to_id = $1 limit 1", [write.exhibit.id])
    : [];
  return {
    exhibits,
    claims: [...claims, ...touchedClaims].map(claimFrom),
    sources: sources.map(sourceFrom),
    supports: supports.map(supportFrom),
    evolution: evolution.map(evolutionFrom),
    contradicts: [],
    audits: [],
    versions: [],
    changelog: [],
  };
}

export async function loadGraph(database: Db, opts: { publicOnly: boolean }): Promise<MuseumSnapshot> {
  const exhibitSql = opts.publicOnly
    ? "select * from exhibits where publication_state in ('canon', 'provisional') and confidence = 'confirmed'"
    : "select * from exhibits";
  const exhibits = (await database.query<Row>(exhibitSql)).map(exhibitFrom);
  const ids = exhibits.map((exhibit) => exhibit.id);
  const claims = ids.length
    ? await database.query<Row>(
        opts.publicOnly
          ? `select * from claims where exhibit_id = any($1::text[]) and publication_state in ('canon', 'provisional')`
          : `select * from claims where exhibit_id = any($1::text[])`,
        [ids],
      )
    : [];
  const claimIds = claims.map((row) => String(row.id));
  const supports = claimIds.length
    ? await database.query<Row>(`select * from supports where claim_id = any($1::text[])`, [claimIds])
    : [];
  const sourceIds = [...new Set(supports.map((row) => String(row.source_id)))];
  const sources = sourceIds.length
    ? await database.query<Row>(`select * from sources where id = any($1::text[])`, [sourceIds])
    : [];
  // The public changelog also lists withdrawn exhibits that were once public, so a withdrawal is
  // never silent. A draft that was withdrawn without ever being public stays out.
  const versions = opts.publicOnly
    ? await database.query<Row>(
        `select v.* from exhibit_versions v
         where v.exhibit_id = any($1::text[])
            or v.exhibit_id in (
              select e.id from exhibits e
              where e.publication_state = 'withdrawn'
                and exists (
                  select 1 from exhibit_versions p
                  where p.exhibit_id = e.id and p.blob->>'publicationState' in ('canon', 'provisional')
                )
            )
         order by v.at, v.version`,
        [ids],
      )
    : await database.query<Row>(`select * from exhibit_versions order by at, version`);
  const evolution = ids.length
    ? await database.query<Row>(
        `select * from evolution where from_id = any($1::text[]) and to_id = any($1::text[])`,
        [ids],
      )
    : [];
  const contradictIds = claimIds.length
    ? await database.query<Row>(
        `select * from contradicts where from_claim_id = any($1::text[]) and to_claim_id = any($1::text[])`,
        [claimIds],
      )
    : [];
  const audits = opts.publicOnly ? [] : await database.query<Row>("select * from audits order by id");
  return {
    exhibits,
    claims: claims.map(claimFrom),
    sources: sources.map(sourceFrom),
    supports: supports.map(supportFrom),
    evolution: evolution.map(evolutionFrom),
    contradicts: contradictIds.map((row) => ({
      fromClaimId: String(row.from_claim_id),
      toClaimId: String(row.to_claim_id),
    })),
    audits: audits.map((row) => ({
      at: iso(row.at),
      by: row.by_role as Role,
      change: String(row.change),
    })),
    versions: versions.map(
      (row): VersionRecord => ({
        nodeId: String(row.exhibit_id),
        version: Number(row.version),
        at: iso(row.at),
        blob: json<ExhibitWrite>(row.blob, {} as ExhibitWrite),
        reason: String(row.reason),
        suggestionId: row.suggestion_id == null ? undefined : String(row.suggestion_id),
      }),
    ),
    changelog: versions.map(
      (row): ChangelogLine => ({
        at: iso(row.at),
        nodeId: String(row.exhibit_id),
        title: json<Partial<ExhibitWrite>>(row.blob, {}).title,
        version: Number(row.version),
        reason: String(row.reason),
        suggestionId: row.suggestion_id == null ? undefined : String(row.suggestion_id),
      }),
    ),
  };
}

async function upsertExhibit(database: Db, exhibit: NonNullable<ReturnType<MemoryStore["getExhibit"]>>): Promise<void> {
  await database.query(
    `insert into exhibits (
      id, era_id, layer, kind, title, start_year, end_year, publication_state, incomplete,
      confidence, official_primary, no_predecessor_in_scope, public_story, technical_account,
      editorial_note, tags, citations, figure, field_change, prose_flags, version, updated_at
    ) values (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17::jsonb,$18::jsonb,$19::jsonb,$20::jsonb,$21,$22
    )
    on conflict (id) do update set
      era_id = excluded.era_id, layer = excluded.layer, kind = excluded.kind, title = excluded.title,
      start_year = excluded.start_year, end_year = excluded.end_year, publication_state = excluded.publication_state,
      incomplete = excluded.incomplete, confidence = excluded.confidence, official_primary = excluded.official_primary,
      no_predecessor_in_scope = excluded.no_predecessor_in_scope, public_story = excluded.public_story,
      technical_account = excluded.technical_account, editorial_note = excluded.editorial_note, tags = excluded.tags,
      citations = excluded.citations, figure = excluded.figure, field_change = excluded.field_change,
      prose_flags = excluded.prose_flags, version = excluded.version, updated_at = excluded.updated_at`,
    [
      exhibit.id,
      exhibit.eraId ?? null,
      exhibit.layer,
      exhibit.kind,
      exhibit.title,
      exhibit.startYear,
      exhibit.endYear ?? null,
      exhibit.publicationState,
      exhibit.incomplete,
      exhibit.confidence ?? null,
      exhibit.officialPrimary ?? null,
      exhibit.noPredecessorInScope ?? null,
      exhibit.publicStory,
      exhibit.technicalAccount ?? null,
      exhibit.editorialNote ?? null,
      exhibit.tags ?? [],
      JSON.stringify(exhibit.citations ?? []),
      exhibit.figure ? JSON.stringify(exhibit.figure) : null,
      exhibit.fieldChange ? JSON.stringify(exhibit.fieldChange) : null,
      JSON.stringify(exhibit.proseFlags ?? []),
      exhibit.version,
      exhibit.updatedAt,
    ],
  );
}

export async function importSnapshot(database: Db, snapshot: MuseumSnapshot): Promise<void> {
  for (const exhibit of snapshot.exhibits) await upsertExhibit(database, exhibit);
  for (const claim of snapshot.claims) {
    await database.query(
      `insert into claims (id, exhibit_id, statement, role, status, publication_state)
       values ($1,$2,$3,$4,$5,$6)
       on conflict (id) do update set statement = excluded.statement, role = excluded.role,
         status = excluded.status, publication_state = excluded.publication_state`,
      [claim.id, claim.exhibitId, claim.statement, claim.role, claim.status, claim.publicationState],
    );
  }
  for (const source of snapshot.sources) {
    await database.query(
      `insert into sources (id, title, year, authors, locator, kind)
       values ($1,$2,$3,$4,$5,$6)
       on conflict (id) do update set title = excluded.title, year = excluded.year,
         authors = excluded.authors, locator = excluded.locator, kind = excluded.kind`,
      [source.id, source.title, source.year, source.authors, source.locator, source.kind],
    );
  }
  for (const link of snapshot.supports) {
    await database.query(
      `insert into supports (claim_id, source_id) values ($1,$2) on conflict do nothing`,
      [link.claimId, link.sourceId],
    );
  }
  for (const link of snapshot.evolution) {
    await database.query(
      `insert into evolution (from_id, to_id, type, source_id, note) values ($1,$2,$3,$4,$5)
       on conflict do nothing`,
      [link.fromId, link.toId, link.type, link.sourceId ?? null, link.note ?? null],
    );
  }
  for (const link of snapshot.contradicts) {
    await database.query(
      `insert into contradicts (from_claim_id, to_claim_id) values ($1,$2) on conflict do nothing`,
      [link.fromClaimId, link.toClaimId],
    );
  }
  for (const version of snapshot.versions) {
    await database.query(
      `insert into exhibit_versions (exhibit_id, version, at, blob, reason, suggestion_id)
       values ($1,$2,$3,$4::jsonb,$5,$6) on conflict do nothing`,
      [
        version.nodeId,
        version.version,
        version.at,
        JSON.stringify(version.blob),
        version.reason,
        version.suggestionId ?? null,
      ],
    );
  }
}

export async function commitWrite(
  database: Db,
  write: Write,
  role: Role,
): Promise<{ ok: true } | { ok: false; violations: Violation[] }> {
  try {
    await database.tx(async (tx) => {
      if (write.exhibit) {
        await tx.query("select id from exhibits where id = $1 for update", [write.exhibit.id]);
      }
      const store = MemoryStore.fromSnapshot(await loadWriteScope(tx, write));
      const result = store.apply(write, role);
      if (!result.ok) throw new CommitRejected(result.violations);
      if (write.exhibit) {
        const exhibit = store.getExhibit(write.exhibit.id);
        if (exhibit) await upsertExhibit(tx, exhibit);
        const version = store.versions(write.exhibit.id).at(-1);
        if (version) {
          await tx.query(
            `insert into exhibit_versions (exhibit_id, version, at, blob, reason, suggestion_id)
             values ($1,$2,$3,$4::jsonb,$5,$6)`,
            [
              version.nodeId,
              version.version,
              version.at,
              JSON.stringify(version.blob),
              version.reason,
              version.suggestionId ?? null,
            ],
          );
        }
      }
      for (const claim of write.claims ?? []) {
        await tx.query(
          `insert into claims (id, exhibit_id, statement, role, status, publication_state)
           values ($1,$2,$3,$4,$5,$6)
           on conflict (id) do update set statement = excluded.statement, role = excluded.role,
             status = excluded.status, publication_state = excluded.publication_state`,
          [claim.id, claim.exhibitId, claim.statement, claim.role, claim.status, claim.publicationState],
        );
      }
      for (const source of write.sources ?? []) {
        await tx.query(
          `insert into sources (id, title, year, authors, locator, kind) values ($1,$2,$3,$4,$5,$6)
           on conflict (id) do update set title = excluded.title, year = excluded.year,
             authors = excluded.authors, locator = excluded.locator, kind = excluded.kind`,
          [source.id, source.title, source.year, source.authors, source.locator, source.kind],
        );
      }
      for (const link of write.supports ?? []) {
        await tx.query(`insert into supports (claim_id, source_id) values ($1,$2) on conflict do nothing`, [
          link.claimId,
          link.sourceId,
        ]);
      }
      for (const link of write.evolution ?? []) {
        await tx.query(
          `insert into evolution (from_id, to_id, type, source_id, note) values ($1,$2,$3,$4,$5) on conflict do nothing`,
          [link.fromId, link.toId, link.type, link.sourceId ?? null, link.note ?? null],
        );
      }
      for (const link of write.contradicts ?? []) {
        await tx.query(
          `insert into contradicts (from_claim_id, to_claim_id) values ($1,$2) on conflict do nothing`,
          [link.fromClaimId, link.toClaimId],
        );
      }
      if (write.deleteClaimId) {
        await tx.query("delete from supports where claim_id = $1", [write.deleteClaimId]);
        await tx.query("delete from contradicts where from_claim_id = $1 or to_claim_id = $1", [write.deleteClaimId]);
        await tx.query("delete from claims where id = $1", [write.deleteClaimId]);
      }
      if (write.retractClaimId) {
        const retracted = await tx.query(
          "update claims set status = 'retracted' where id = $1 returning id",
          [write.retractClaimId],
        );
        if (retracted.length > 0) {
          await tx.query("insert into audits (at, by_role, change) values ($1,$2,$3)", [
            new Date().toISOString(),
            role,
            `retracted ${write.retractClaimId}`,
          ]);
        }
      }
      if (write.suggestionId && write.exhibit) {
        const version = store.versions(write.exhibit.id).at(-1)?.version ?? null;
        await tx.query(
          `update suggestions set status = 'accepted', resolved_at = now(), resolved_version = $2 where id = $1`,
          [write.suggestionId, version],
        );
      }
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof CommitRejected) return { ok: false, violations: error.violations };
    throw error;
  }
}
