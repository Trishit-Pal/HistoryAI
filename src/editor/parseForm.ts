import type { Write } from "../store/memory";

function text(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function jsonField<T>(formData: FormData, name: string, fallback: T): T | { error: string } {
  const raw = text(formData, name);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return { error: `${name} is not valid JSON.` };
  }
}

export function parseExhibitForm(formData: FormData): { ok: true; write: Write } | { ok: false; error: string } {
  const reason = text(formData, "reason");
  if (reason.length < 3) return { ok: false, error: "A reason is required." };
  const citations = jsonField(formData, "citations", []);
  if ("error" in (citations as { error?: string })) return { ok: false, error: (citations as { error: string }).error };
  const figure = jsonField<NonNullable<Write["exhibit"]>["figure"]>(formData, "figure", undefined);
  if (figure && "error" in figure) return { ok: false, error: figure.error };
  const claims = jsonField(formData, "claims", undefined);
  if (claims && typeof claims === "object" && "error" in claims) return { ok: false, error: claims.error };
  const sources = jsonField(formData, "sources", undefined);
  if (sources && typeof sources === "object" && "error" in sources && !Array.isArray(sources)) {
    return { ok: false, error: (sources as { error: string }).error };
  }
  const supports = jsonField(formData, "supports", undefined);
  if (supports && typeof supports === "object" && "error" in supports && !Array.isArray(supports)) {
    return { ok: false, error: (supports as { error: string }).error };
  }
  const evolution = jsonField(formData, "evolution", undefined);
  if (evolution && typeof evolution === "object" && "error" in evolution && !Array.isArray(evolution)) {
    return { ok: false, error: (evolution as { error: string }).error };
  }
  const before = text(formData, "fieldBefore");
  const after = text(formData, "fieldAfter");
  const fieldUrls = text(formData, "fieldCitations")
    .split(/\s+/)
    .map((url) => url.trim())
    .filter(Boolean);
  const endYear = text(formData, "endYear");
  const write: Write = {
    reason,
    mode: text(formData, "mode") === "create" ? "create" : "replace",
    suggestionId: text(formData, "suggestionId") || undefined,
    expectedUpdatedAt: text(formData, "expectedUpdatedAt") || undefined,
    exhibit: {
      id: text(formData, "id"),
      title: text(formData, "title"),
      kind: text(formData, "kind") as NonNullable<Write["exhibit"]>["kind"],
      startYear: Number(text(formData, "startYear")),
      endYear: endYear ? Number(endYear) : undefined,
      publicStory: text(formData, "publicStory"),
      technicalAccount: text(formData, "technicalAccount") || undefined,
      editorialNote: text(formData, "editorialNote") || undefined,
      publicationState: text(formData, "publicationState") as NonNullable<Write["exhibit"]>["publicationState"],
      incomplete: formData.get("incomplete") === "on" || text(formData, "incomplete") === "true",
      layer: (text(formData, "layer") || undefined) as NonNullable<Write["exhibit"]>["layer"],
      eraId: (text(formData, "eraId") || undefined) as NonNullable<Write["exhibit"]>["eraId"],
      confidence: (text(formData, "confidence") || undefined) as NonNullable<Write["exhibit"]>["confidence"],
      officialPrimary: formData.get("officialPrimary") === "on",
      noPredecessorInScope: formData.get("noPredecessorInScope") === "on",
      citations: citations as NonNullable<Write["exhibit"]>["citations"],
      figure,
      fieldChange:
        before || after
          ? { before, after, citationUrls: fieldUrls }
          : undefined,
    },
    claims: Array.isArray(claims) ? claims : undefined,
    sources: Array.isArray(sources) ? sources : undefined,
    supports: Array.isArray(supports) ? supports : undefined,
    evolution: Array.isArray(evolution) ? evolution : undefined,
  };
  return { ok: true, write };
}
