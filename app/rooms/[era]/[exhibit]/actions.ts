"use server";

import { headers } from "next/headers";
import { parseSuggestion } from "../../../../src/suggest/parse";
import { db } from "../../../../src/server/db";
import { getMuseum } from "../../../../src/server/museum";
import { hit, ipKey } from "../../../../src/server/rateLimit";
import { verifyTurnstile } from "../../../../src/server/turnstile";

export type SuggestionValues = { kind: string; body: string; sourceUrl: string };

export type SuggestionState = { ok: boolean; message: string; values?: SuggestionValues };

export async function submitSuggestion(_prev: SuggestionState, formData: FormData): Promise<SuggestionState> {
  const values: SuggestionValues = {
    kind: String(formData.get("kind") ?? "correction"),
    body: String(formData.get("body") ?? ""),
    sourceUrl: String(formData.get("sourceUrl") ?? ""),
  };
  const fail = (message: string): SuggestionState => ({ ok: false, message, values });
  const museum = await getMuseum();
  if (museum.source !== "live") return fail("Suggestions are paused while the archived copy is showing.");
  const parsed = parseSuggestion(formData);
  if (!parsed.ok) return fail(parsed.error);
  if (parsed.value.honeypot) return { ok: true, message: "Suggestion received." };
  if (!museum.exhibits[parsed.value.exhibitId]) return fail("That exhibit is not recognized.");
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!(await verifyTurnstile(parsed.value.token, ip))) return fail("The spam check failed. Try again.");
  const database = db();
  const key = ipKey(headerList);
  if (!(await hit(database, "suggest:ip", key, 3, 60 * 60))) {
    return fail("That is enough suggestions for this hour.");
  }
  if (!(await hit(database, "suggest:global", "all", 100, 24 * 60 * 60))) {
    return fail("The museum has enough suggestions for today.");
  }
  await database.query(
    `insert into suggestions (exhibit_id, kind, body, source_url, ip_hash) values ($1,$2,$3,$4,$5)`,
    [parsed.value.exhibitId, parsed.value.kind, parsed.value.body, parsed.value.sourceUrl ?? null, key],
  );
  return { ok: true, message: "Suggestion received. An editor will review it." };
}
