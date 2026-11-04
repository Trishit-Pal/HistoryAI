import { readdirSync, readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { seedMuseum } from "../seed/eras";
import { commitWrite, importSnapshot, loadGraph } from "./graph";
import { createPgliteDb, migratePglite } from "./pglite";
import { hit } from "./rateLimit";

// Runs every migration, then drops to the least-privilege role the deployed app uses.
// A missing grant or RLS policy for any app write shows up here as "permission denied".
const client = new PGlite();
const database = createPgliteDb(client);

beforeAll(async () => {
  for (const file of readdirSync("db/migrations").filter((name) => name.endsWith(".sql")).sort()) {
    await migratePglite(client, readFileSync(`db/migrations/${file}`, "utf8"));
  }
  await importSnapshot(database, seedMuseum().snapshot()); // seeding runs as the owner
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
      `insert into suggestions (exhibit_id, kind, body, ip_hash) values ('evt_history_overview', 'correction', $1, 'h') returning id`,
      ["A suggestion body of at least twenty characters."],
    );
    expect(rows[0]?.id).toBeTruthy();
  });

  it("cannot delete exhibits", async () => {
    await expect(database.query("delete from exhibits where id = 'role_probe'")).rejects.toThrow(/permission denied/);
  });
});
