import { seedMuseum } from "../src/seed/eras";
import { importSnapshot } from "../src/server/graph";
import { connect } from "../src/server/pg";

const url = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("Set DATABASE_MIGRATION_URL to the owner connection string.");
  process.exit(1);
}

const { db: database, end } = connect(url, { pooled: false });
try {
  const existing = await database.query<{ count: string }>("select count(*)::text as count from exhibits");
  if (Number(existing[0]?.count ?? 0) > 0) {
    console.log("exhibits already present; seed skipped");
  } else {
    await database.tx((tx) => importSnapshot(tx, seedMuseum().snapshot()));
    console.log("seeded exhibits");
  }
} finally {
  await end();
}
