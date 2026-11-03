import { mkdirSync, writeFileSync } from "node:fs";
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
    write(await loadGraph(db, { publicOnly: true }));
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
