import { mkdirSync, writeFileSync } from "node:fs";
import { buildMuseumData } from "../src/museum/build";
import { seedMuseum } from "../src/seed/eras";
import { loadGraph } from "../src/server/graph";
import { connect } from "../src/server/pg";
import type { MuseumSnapshot } from "../src/store/memory";

const fromSeed = process.argv.includes("--from-seed");
const ifReachable = process.argv.includes("--if-reachable");

function write(snapshot: MuseumSnapshot) {
  const generatedAt = new Date().toISOString().slice(0, 10);
  mkdirSync("data", { recursive: true });
  writeFileSync("data/museum-snapshot.json", `${JSON.stringify({ generatedAt, snapshot })}\n`);
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (fromSeed || !url) {
    if (ifReachable && !url) return;
    write(seedMuseum().snapshot());
    return;
  }
  const { db, end } = connect(url, { pooled: true });
  try {
    const live = await loadGraph(db, { publicOnly: true });
    // An unseeded or un-audited database must not overwrite the archive the site falls back to.
    if (buildMuseumData(live, { source: "live" }).nodes.length === 0) {
      console.error("Snapshot left unchanged: the live database has no public exhibit.");
      if (!ifReachable) process.exitCode = 1;
      return;
    }
    write(live);
  } catch (error) {
    if (!ifReachable) throw error;
    console.error("Snapshot left unchanged:", error instanceof Error ? error.message : error);
  } finally {
    await end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
