import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { parse } from "csv-parse/sync";
import { strFromU8, unzipSync } from "fflate";
import { buildAtlas } from "../src/atlas/build";
import { assertEpochLicence } from "../src/atlas/licenceGuard";
import { buildGlobe } from "../src/globe/build";

/**
 * Builds data/atlas-snapshot.json and data/globe-snapshot.json from Epoch AI's published models file.
 *   npm run atlas:snapshot                 downloads the current zip
 *   npm run atlas:snapshot -- --zip <path> reads a zip you already have (offline, or a pinned copy)
 */
const EPOCH_ZIP_URL = "https://epoch.ai/data/ai_models.zip";
const CSV_NAME = "all_ai_models.csv";
const README_NAME = "README.md";
const OUTPUT = "data/atlas-snapshot.json";
const GLOBE_OUTPUT = "data/globe-snapshot.json";
const MAX_DOWNLOAD_BYTES = 25 * 1024 * 1024;
const MAX_ENTRY_BYTES = 50 * 1024 * 1024;
const DOWNLOAD_TIMEOUT_MS = 60_000;

/**
 * Reads the body chunk by chunk and stops the moment it passes the cap, so a hostile or broken
 * server cannot make this buffer more than MAX_DOWNLOAD_BYTES. Redirects are refused: the URL is
 * Epoch's own and answers directly.
 */
async function download(url: string): Promise<Uint8Array> {
  const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS) });
  if (!response.ok || !response.body) throw new Error(`Epoch download failed: ${response.status} ${response.statusText}`);
  const declared = Number(response.headers.get("content-length") ?? 0);
  if (declared > MAX_DOWNLOAD_BYTES) throw new Error(`Epoch says the zip is ${declared} bytes, over the cap.`);

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > MAX_DOWNLOAD_BYTES) {
      await reader.cancel();
      throw new Error(`Epoch zip passed ${MAX_DOWNLOAD_BYTES} bytes, over the cap.`);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes;
}

function zipPath(): string | undefined {
  const index = process.argv.indexOf("--zip");
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const local = zipPath();
  const zip = local ? new Uint8Array(readFileSync(local)) : await download(EPOCH_ZIP_URL);
  // So a change in the committed snapshot can be tied to the exact file it was built from.
  process.stdout.write(`Epoch zip sha256: ${createHash("sha256").update(zip).digest("hex")}\n`);

  // Untrusted archive: unpack only the two entries we need, into memory, with a size cap.
  const files = unzipSync(zip, {
    filter: (entry) => (entry.name === CSV_NAME || entry.name === README_NAME) && entry.originalSize <= MAX_ENTRY_BYTES,
  });
  const csv = files[CSV_NAME];
  if (!csv) throw new Error(`${CSV_NAME} not found in the Epoch zip.`);
  const readme = files[README_NAME];
  assertEpochLicence(readme ? strFromU8(readme) : undefined);

  const rows = parse(strFromU8(csv), { columns: true, skip_empty_lines: true, bom: true }) as Record<string, string>[];
  const generatedAt = new Date().toISOString().slice(0, 10);
  const snapshot = buildAtlas(rows, { generatedAt });
  const globe = buildGlobe(rows, { generatedAt, atlasNames: new Set(snapshot.models.names) });

  mkdirSync("data", { recursive: true });
  writeFileSync(OUTPUT, `${JSON.stringify(snapshot)}\n`);
  writeFileSync(GLOBE_OUTPUT, `${JSON.stringify(globe)}\n`);
  const { totals } = snapshot;
  process.stdout.write(
    `Wrote ${OUTPUT}: ${totals.plotted} of ${totals.rows} models plotted ` +
      `(${totals.withCompute} with compute, ${totals.withParameters} with parameters).\n`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
