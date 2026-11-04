import { readdirSync, readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { seedMuseum } from "../seed/eras";
import { createPgliteDb, migratePglite } from "./pglite";
import { commitWrite, importSnapshot, loadGraph } from "./graph";

const client = new PGlite();
const database = createPgliteDb(client);

beforeAll(async () => {
  for (const file of readdirSync("db/migrations").filter((name) => name.endsWith(".sql")).sort()) {
    await migratePglite(client, readFileSync(`db/migrations/${file}`, "utf8"));
  }
  await importSnapshot(database, seedMuseum().snapshot());
});

afterAll(async () => {
  await client.close();
});

describe("postgres graph", () => {
  it("hides drafts and keeps the first version when a second write lands", async () => {
    const hidden = await commitWrite(
      database,
      {
        exhibit: {
          id: "draft_db",
          title: "Hidden",
          kind: "idea",
          startYear: 1950,
          publicStory: "Not on the floor.",
          publicationState: "draft",
          incomplete: true,
          layer: "context",
          eraId: "era_1_founding",
          confidence: "rumored",
          citations: [{ url: "https://example.com/d", publisher: "Example", retrieved: "2026-10-03" }],
        },
        reason: "A draft",
      },
      "editor",
    );
    expect(hidden.ok).toBe(true);
    const publicGraph = await loadGraph(database, { publicOnly: true });
    expect(publicGraph.exhibits.some((exhibit) => exhibit.id === "draft_db")).toBe(false);

    const before = await loadGraph(database, { publicOnly: false });
    const plaque = before.exhibits.find((exhibit) => exhibit.id === "ctx_1843_analytical_engine");
    expect(plaque).toBeTruthy();
    const revised = await commitWrite(
      database,
      {
        exhibit: { ...plaque!, publicStory: "A revised plaque." },
        reason: "Clarified the plaque",
        expectedUpdatedAt: plaque!.updatedAt,
      },
      "editor",
    );
    expect(revised.ok).toBe(true);
    const after = await loadGraph(database, { publicOnly: false });
    const versions = after.versions.filter((entry) => entry.nodeId === "ctx_1843_analytical_engine");
    expect(versions[0]?.blob.publicStory).not.toBe("A revised plaque.");
    expect(versions.at(-1)?.reason).toBe("Clarified the plaque");
  });

  it("rolls back a violation and a stale write", async () => {
    const before = await loadGraph(database, { publicOnly: false });
    const rejected = await commitWrite(
      database,
      {
        exhibit: {
          id: "ctx_1843_analytical_engine",
          title: "Sketch of the Analytical Engine",
          kind: "idea",
          startYear: 1843,
          publicStory: "A framing plaque.",
          publicationState: "canon",
          incomplete: false,
          layer: "context",
          confidence: "reported",
          citations: [{ url: "javascript:alert(1)", publisher: "Bad", retrieved: "2026-10-03" }],
        },
        reason: "Bad link",
      },
      "editor",
    );
    expect(rejected.ok).toBe(false);
    const stale = await commitWrite(
      database,
      {
        exhibit: {
          ...(before.exhibits.find((exhibit) => exhibit.id === "ctx_1843_analytical_engine") as NonNullable<
            (typeof before.exhibits)[number]
          >),
          publicStory: "Stale.",
        },
        reason: "Too late",
        expectedUpdatedAt: "1999-01-01T00:00:00.000Z",
      },
      "editor",
    );
    expect(stale.ok).toBe(false);
    const after = await loadGraph(database, { publicOnly: false });
    expect(after.exhibits.find((exhibit) => exhibit.id === "ctx_1843_analytical_engine")?.publicStory).toBe(
      before.exhibits.find((exhibit) => exhibit.id === "ctx_1843_analytical_engine")?.publicStory,
    );
  });

  it("refuses to rewrite a stored version and records an accepted suggestion", async () => {
    await expect(
      database.query("update exhibit_versions set reason = 'tampered' where exhibit_id = $1", ["ctx_1843_analytical_engine"]),
    ).rejects.toThrow(/append-only/);
    const inserted = await database.query<{ id: string }>(
      `insert into suggestions (exhibit_id, kind, body, ip_hash) values ($1, 'correction', $2, 'hash') returning id`,
      ["ctx_1843_analytical_engine", "The plaque year should mention the entrance, not a later machine."],
    );
    const id = inserted[0]?.id;
    const current = (await loadGraph(database, { publicOnly: false })).exhibits.find(
      (exhibit) => exhibit.id === "ctx_1843_analytical_engine",
    );
    const saved = await commitWrite(
      database,
      {
        exhibit: current!,
        reason: "Reviewed a visitor note",
        suggestionId: id,
        expectedUpdatedAt: current!.updatedAt,
      },
      "editor",
    );
    expect(saved.ok).toBe(true);
    const rows = await database.query<{ status: string; resolved_version: number }>(
      "select status, resolved_version from suggestions where id = $1",
      [id],
    );
    expect(rows[0]?.status).toBe("accepted");
    expect(rows[0]?.resolved_version).toBeGreaterThan(1);
  });

  it("revises a canon technical exhibit using only the rows that write touches", async () => {
    const graph = await loadGraph(database, { publicOnly: false });
    const canon = graph.exhibits.find((exhibit) => exhibit.publicationState === "canon" && exhibit.layer === "technical");
    expect(canon).toBeTruthy();
    const saved = await commitWrite(
      database,
      { exhibit: canon!, reason: "Re-read the sources", mode: "replace", expectedUpdatedAt: canon!.updatedAt },
      "editor",
    );
    expect(saved).toEqual({ ok: true });
  });

  it("clears an omitted field on replace and refuses a create over an existing id", async () => {
    const graph = await loadGraph(database, { publicOnly: false });
    const plaque = graph.exhibits.find((exhibit) => exhibit.id === "ctx_1843_analytical_engine")!;
    const noted = await commitWrite(
      database,
      {
        exhibit: { ...plaque, editorialNote: "Temporary note." },
        reason: "Add a note",
        mode: "replace",
        expectedUpdatedAt: plaque.updatedAt,
      },
      "editor",
    );
    expect(noted.ok).toBe(true);
    const withNote = (await loadGraph(database, { publicOnly: false })).exhibits.find(
      (exhibit) => exhibit.id === "ctx_1843_analytical_engine",
    )!;
    expect(withNote.editorialNote).toBe("Temporary note.");
    const { editorialNote: _dropped, ...withoutNote } = withNote;
    const cleared = await commitWrite(
      database,
      { exhibit: withoutNote, reason: "Remove the note", mode: "replace", expectedUpdatedAt: withNote.updatedAt },
      "editor",
    );
    expect(cleared.ok).toBe(true);
    const after = (await loadGraph(database, { publicOnly: false })).exhibits.find(
      (exhibit) => exhibit.id === "ctx_1843_analytical_engine",
    )!;
    expect(after.editorialNote).toBeUndefined();
    expect(after.tags).toEqual(withNote.tags);

    const collision = await commitWrite(
      database,
      { exhibit: { ...after, publicStory: "Overwritten." }, reason: "New exhibit", mode: "create" },
      "editor",
    );
    expect(collision.ok).toBe(false);
  });

  it("rejects an unknown era instead of storing it", async () => {
    const result = await commitWrite(
      database,
      {
        exhibit: {
          id: "bad_era",
          title: "Bad era",
          kind: "idea",
          startYear: 1950,
          publicStory: "Typo in the era.",
          publicationState: "draft",
          incomplete: true,
          layer: "context",
          eraId: "era_99" as never,
          citations: [{ url: "https://example.com/e", publisher: "Example", retrieved: "2026-10-03" }],
        },
        reason: "Typo",
        mode: "create",
      },
      "editor",
    );
    expect(result.ok).toBe(false);
  });

  it("keeps withdrawn exhibits off the floor but lists their versions in the public changelog", async () => {
    const publicGraph = await loadGraph(database, { publicOnly: true });
    expect(publicGraph.exhibits.some((exhibit) => exhibit.id === "evt_1987_lisp_collapse")).toBe(false);
    const lines = publicGraph.changelog.filter((line) => line.nodeId === "evt_1987_lisp_collapse");
    expect(lines.at(-1)?.reason).toMatch(/^Withdrawn: /);
    expect(lines.at(-1)?.title).toBe("LISP-machine market collapse");
    expect(publicGraph.changelog.some((line) => line.nodeId === "draft_db")).toBe(false);
  });

  it("keeps a draft withdrawn without ever being public out of the public changelog", async () => {
    const draft = {
      id: "draft_withdrawn_db",
      title: "Never shown",
      kind: "idea" as const,
      startYear: 1950,
      publicStory: "A draft.",
      publicationState: "draft" as const,
      incomplete: true,
      layer: "context" as const,
      eraId: "era_1_founding" as const,
      confidence: "rumored" as const,
      citations: [{ url: "https://example.com/w", publisher: "Example", retrieved: "2026-11-04" }],
    };
    expect((await commitWrite(database, { exhibit: draft, reason: "Draft" }, "editor")).ok).toBe(true);
    const withdrawn = await commitWrite(
      database,
      { exhibit: { ...draft, publicationState: "withdrawn" }, reason: "Withdrawn: secret" },
      "editor",
    );
    expect(withdrawn.ok).toBe(true);
    const publicGraph = await loadGraph(database, { publicOnly: true });
    expect(publicGraph.changelog.some((line) => line.nodeId === "draft_withdrawn_db")).toBe(false);
    expect(publicGraph.versions.some((entry) => entry.nodeId === "draft_withdrawn_db")).toBe(false);
  });

  it("serves only confirmed exhibits on the public graph", async () => {
    const reported = {
      id: "ctx_reported_db",
      title: "Reported only",
      kind: "idea" as const,
      startYear: 1950,
      publicStory: "One secondary source.",
      publicationState: "canon" as const,
      incomplete: false,
      layer: "context" as const,
      eraId: "era_1_founding" as const,
      confidence: "reported" as const,
      citations: [{ url: "https://example.com/r", publisher: "Example", retrieved: "2026-11-04" }],
    };
    expect((await commitWrite(database, { exhibit: reported, reason: "Reported" }, "editor")).ok).toBe(true);
    const publicGraph = await loadGraph(database, { publicOnly: true });
    expect(publicGraph.exhibits.length).toBeGreaterThan(0);
    expect(publicGraph.exhibits.every((exhibit) => exhibit.confidence === "confirmed")).toBe(true);
    const editorGraph = await loadGraph(database, { publicOnly: false });
    expect(editorGraph.exhibits.some((exhibit) => exhibit.id === "ctx_reported_db")).toBe(true);
  });

  it("keeps draft claims off the public graph", async () => {
    await database.query(
      `insert into claims (id, exhibit_id, statement, role, status, publication_state)
       values ('claim_draft_db', 'ctx_1843_analytical_engine', 'Not yet reviewed.', 'what_changed', 'asserted', 'draft')`,
    );
    const publicGraph = await loadGraph(database, { publicOnly: true });
    expect(publicGraph.claims.some((claim) => claim.id === "claim_draft_db")).toBe(false);
  });
});
