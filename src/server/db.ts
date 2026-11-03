import "server-only";
import { connect, type Db } from "./pg";

export type { Db };

let cached: Db | undefined;

export function db(): Db {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  cached ??= connect(url, { pooled: true }).db;
  return cached;
}
