// Applies the November 2026 accuracy audit to an existing database, as museum_app.
//   DATABASE_URL="<museum_app url>" npm run db:audit [-- --dry-run]
import { applyAudit } from "../src/server/audit";
import { connect } from "../src/server/pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Set DATABASE_URL to the museum_app connection string.");
  process.exit(1);
}
const dryRun = process.argv.includes("--dry-run");

const { db, end } = connect(url, { pooled: true });
try {
  const result = await applyAudit(db, { dryRun });
  for (const line of result.lines) console.log(line);
  if (!dryRun && result.writes > 0) {
    // revalidateTag needs the Next runtime, so a script cannot clear the cached museum itself.
    console.log(`${result.writes} change(s) written. Redeploy, or save any exhibit in the editor, to refresh MUSEUM_TAG.`);
  }
  if (result.failed) process.exitCode = 1;
} finally {
  await end();
}
