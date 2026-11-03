import { isHttpUrl } from "../domain/urls";

export type SuggestionInput = {
  exhibitId: string;
  kind: "correction" | "source";
  body: string;
  sourceUrl?: string;
  honeypot: string;
  token: string;
};

export function parseSuggestion(formData: FormData): { ok: true; value: SuggestionInput } | { ok: false; error: string } {
  const exhibitId = String(formData.get("exhibitId") ?? "");
  const kind = String(formData.get("kind") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim();
  const honeypot = String(formData.get("website") ?? "");
  const token = String(formData.get("cf-turnstile-response") ?? formData.get("turnstileToken") ?? "");
  if (!/^[a-z0-9_]{1,80}$/.test(exhibitId)) return { ok: false, error: "That exhibit is not recognized." };
  if (kind !== "correction" && kind !== "source") return { ok: false, error: "Choose a correction or a source." };
  if (body.length < 20 || body.length > 2000) return { ok: false, error: "Write between 20 and 2000 characters." };
  if (sourceUrl && !isHttpUrl(sourceUrl)) return { ok: false, error: "The source link must be http or https." };
  if (kind === "source" && !sourceUrl) return { ok: false, error: "A source suggestion needs a link." };
  return { ok: true, value: { exhibitId, kind, body, sourceUrl: sourceUrl || undefined, honeypot, token } };
}
