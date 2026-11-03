import { readFileSync, readdirSync } from "node:fs";
import postgres from "postgres";

const url = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("Set DATABASE_MIGRATION_URL to the owner connection string.");
  process.exit(1);
}

const sql = postgres(url, { ssl: "require", max: 1 });
const files = readdirSync("db/migrations").filter((name) => name.endsWith(".sql")).sort();
await sql.unsafe(
  "create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())",
);
for (const name of files) {
  const applied = await sql<{ name: string }[]>`select name from schema_migrations where name = ${name}`;
  if (applied.length > 0) continue;
  const body = readFileSync(`db/migrations/${name}`, "utf8");
  await sql.begin(async (tx) => {
    await tx.unsafe(body);
    await tx`insert into schema_migrations (name) values (${name})`;
  });
  console.log(`applied ${name}`);
}
await sql.end();
