import { db } from "../../../src/server/db";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization");
  if (!secret || header !== `Bearer ${secret}`) {
    return Response.json({ ok: false }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) return Response.json({ ok: false }, { status: 503 });
  const rows = await db().query<{ count: string }>("select count(*)::text as count from exhibits");
  await db().query("delete from rate_events where at < now() - interval '2 days'");
  return Response.json({ ok: true, exhibits: Number(rows[0]?.count ?? 0) });
}
