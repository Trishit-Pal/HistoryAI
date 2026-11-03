import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { hit } from "./rateLimit";
import { createPgliteDb, migratePglite } from "./pglite";

const client = new PGlite();
const database = createPgliteDb(client);

beforeAll(async () => {
  await migratePglite(client, readFileSync("db/migrations/0001_schema.sql", "utf8"));
});

afterAll(async () => {
  await client.close();
});

describe("rate limits", () => {
  it("allows N hits and refuses the next one in the window", async () => {
    expect(await hit(database, "suggest:ip", "abc", 2, 3600)).toBe(true);
    expect(await hit(database, "suggest:ip", "abc", 2, 3600)).toBe(true);
    expect(await hit(database, "suggest:ip", "abc", 2, 3600)).toBe(false);
    await database.query("update rate_events set at = now() - interval '2 hours'");
    expect(await hit(database, "suggest:ip", "abc", 2, 3600)).toBe(true);
  });
});
