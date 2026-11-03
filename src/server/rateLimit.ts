import "server-only";
import { createHmac } from "node:crypto";
import type { Db } from "./pg";

export function ipKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const secret = process.env.IP_HASH_SECRET || "dev-ip-hash";
  return createHmac("sha256", secret).update(forwarded).digest("hex");
}

export async function hit(database: Db, bucket: string, key: string, limit: number, windowSec: number): Promise<boolean> {
  const rows = await database.query<{ count: string }>(
    `select count(*)::text as count from rate_events
     where bucket = $1 and key = $2 and at > now() - make_interval(secs => $3)`,
    [bucket, key, windowSec],
  );
  const count = Number(rows[0]?.count ?? 0);
  if (count >= limit) return false;
  await database.query("insert into rate_events (bucket, key) values ($1, $2)", [bucket, key]);
  return true;
}
