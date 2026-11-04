import { readdirSync, readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { seedMuseum } from "../seed/eras";
import type { MuseumSnapshot } from "../store/memory";
import { applyAudit, CONFIRM_REASON, INSERT_REASON } from "./audit";
import { commitWrite, importSnapshot, loadGraph } from "./graph";
import { createPgliteDb, migratePglite } from "./pglite";
import { hit } from "./rateLimit";

// Runs every migration, then drops to the least-privilege role the deployed app uses.
// A missing grant or RLS policy for any app write shows up here as "permission denied".
const client = new PGlite();
const database = createPgliteDb(client);
// Left out of the import, so the database predates this exhibit and db:audit has to add it.
const MISSING = "evt_2023_mistral_7b";

function snapshotWithout(id: string): MuseumSnapshot {
  const snapshot = seedMuseum().snapshot();
  return {
    ...snapshot,
    exhibits: snapshot.exhibits.filter((exhibit) => exhibit.id !== id),
    versions: snapshot.versions.filter((version) => version.nodeId !== id),
    changelog: snapshot.changelog.filter((line) => line.nodeId !== id),
    audits: snapshot.audits.filter((audit) => !audit.change.includes(id)),
  };
}

beforeAll(async () => {
  for (const file of readdirSync("db/migrations").filter((name) => name.endsWith(".sql")).sort()) {
    await migratePglite(client, readFileSync(`db/migrations/${file}`, "utf8"));
  }
  await importSnapshot(database, snapshotWithout(MISSING)); // seeding runs as the owner
  await client.exec("set role museum_app");
}, 60_000);

afterAll(async () => {
  await client.close();
});

const exhibit = {
  id: "role_probe",
  title: "Role probe",
  kind: "idea" as const,
  startYear: 1950,
  publicStory: "Written as museum_app.",
  publicationState: "draft" as const,
  incomplete: true,
  layer: "context" as const,
  eraId: "era_1_founding" as const,
  confidence: "rumored" as const,
  citations: [{ url: "https://example.com/p", publisher: "Example", retrieved: "2026-10-03" }],
};

describe("museum_app role", () => {
  it("commits an exhibit with a claim, then deletes the claim", async () => {
    const created = await commitWrite(
      database,
      {
        exhibit,
        reason: "Probe",
        claims: [
          { id: "claim_probe", exhibitId: "role_probe", statement: "Probe.", role: "what_changed", status: "established", publicationState: "draft" },
        ],
        sources: [{ id: "src_probe", title: "Probe", year: 1950, authors: "A", locator: "https://example.com/s", kind: "paper" }],
        supports: [{ claimId: "claim_probe", sourceId: "src_probe" }],
      },
      "editor",
    );
    expect(created).toEqual({ ok: true });
    const deleted = await commitWrite(database, { deleteClaimId: "claim_probe", reason: "Probe delete" }, "editor");
    expect(deleted).toEqual({ ok: true });
    const rows = await database.query("select 1 from claims where id = 'claim_probe'");
    expect(rows).toHaveLength(0);
  });

  it("records and prunes rate events", async () => {
    expect(await hit(database, "role:test", "k", 5, 3600)).toBe(true);
    await database.query("delete from rate_events where at < now() - interval '2 days'"); // keepalive route
  });

  it("reads the public graph and inserts a suggestion", async () => {
    const graph = await loadGraph(database, { publicOnly: true });
    expect(graph.exhibits.length).toBeGreaterThan(0);
    expect(graph.exhibits.some((e) => e.id === "role_probe")).toBe(false);
    const rows = await database.query<{ id: string }>(
      `insert into suggestions (exhibit_id, kind, body, ip_hash) values ('evt_1956_dartmouth', 'correction', $1, 'h') returning id`,
      ["A suggestion body of at least twenty characters."],
    );
    expect(rows[0]?.id).toBeTruthy();
  });

  it("retracts a claim and withdraws an exhibit", async () => {
    const claim = { id: "claim_retract", exhibitId: "role_probe", statement: "Retract me.", role: "what_changed" as const, status: "established" as const, publicationState: "draft" as const };
    expect(await commitWrite(database, { exhibit, claims: [claim], reason: "Probe claim" }, "editor")).toEqual({ ok: true });
    expect(await commitWrite(database, { retractClaimId: "claim_retract", reason: "Probe retract" }, "editor")).toEqual({ ok: true });
    const claims = await database.query<{ status: string }>("select status from claims where id = $1", ["claim_retract"]);
    expect(claims[0]?.status).toBe("retracted");
    const audits = await database.query("select 1 from audits where change = $1", ["retracted claim_retract"]);
    expect(audits).toHaveLength(1);

    const withdrawn = await commitWrite(
      database,
      { exhibit: { ...exhibit, publicationState: "withdrawn" }, reason: "Withdrawn: probe" },
      "editor",
    );
    expect(withdrawn).toEqual({ ok: true });
    const rows = await database.query<{ publication_state: string }>("select publication_state from exhibits where id = $1", ["role_probe"]);
    expect(rows[0]?.publication_state).toBe("withdrawn");
  });

  it("db:audit inserts a missing seed exhibit once", async () => {
    const dry = await applyAudit(database, { dryRun: true });
    expect(dry).toMatchObject({ failed: false, writes: 0 });
    expect(dry.lines).toContain(`would insert: ${MISSING}`);
    expect((await loadGraph(database, { publicOnly: false })).exhibits.some((e) => e.id === MISSING)).toBe(false);

    const first = await applyAudit(database);
    expect(first).toMatchObject({ failed: false, writes: 1 });
    expect(first.lines).toContain(`insert: ${MISSING}`);
    const graph = await loadGraph(database, { publicOnly: true });
    expect(graph.exhibits.find((e) => e.id === MISSING)).toMatchObject({ confidence: "confirmed", publicationState: "canon" });
    expect(graph.versions.filter((v) => v.nodeId === MISSING).at(-1)?.reason).toBe(INSERT_REASON);

    const second = await applyAudit(database);
    expect(second).toMatchObject({ failed: false, writes: 0 });
  });

  it("applies the accuracy audit to an older database, once", async () => {
    // Pretend this database predates the audit: one exhibit back to reported, one withdrawal undone.
    const graph = await loadGraph(database, { publicOnly: false });
    const turing = graph.exhibits.find((e) => e.id === "evt_1950_turing")!;
    const lisp = graph.exhibits.find((e) => e.id === "evt_1987_lisp_collapse")!;
    expect(await commitWrite(database, { exhibit: { ...turing, confidence: "reported", officialPrimary: false }, reason: "Old" }, "editor")).toEqual({ ok: true });
    expect(await commitWrite(database, { exhibit: { ...lisp, publicationState: "canon" }, reason: "Old" }, "editor")).toEqual({ ok: true });

    const first = await applyAudit(database);
    expect(first.failed).toBe(false);
    expect(first.writes).toBe(2);
    const after = await loadGraph(database, { publicOnly: false });
    expect(after.exhibits.find((e) => e.id === "evt_1950_turing")).toMatchObject({ confidence: "confirmed", officialPrimary: true });
    expect(after.exhibits.find((e) => e.id === "evt_1987_lisp_collapse")?.publicationState).toBe("withdrawn");
    expect(after.versions.filter((v) => v.nodeId === "evt_1987_lisp_collapse").at(-1)?.reason).toMatch(/^Withdrawn: /);
    // Only confidence fields changed, so the reason must not claim a wording fix.
    expect(after.versions.filter((v) => v.nodeId === "evt_1950_turing").at(-1)?.reason).toBe(CONFIRM_REASON);

    const second = await applyAudit(database);
    expect(second).toMatchObject({ failed: false, writes: 0 });
  });

  it("cannot delete exhibits", async () => {
    await expect(database.query("delete from exhibits where id = 'role_probe'")).rejects.toThrow(/permission denied/);
  });
});
