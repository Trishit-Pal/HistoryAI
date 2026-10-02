import type { Citation, Confidence } from "./types";

export function sourceDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

export function independentDomains(citations: Citation[]): number {
  return new Set(citations.map((citation) => sourceDomain(citation.url))).size;
}

export function highestAllowedConfidence(
  citations: Citation[],
  flags: { officialPrimary?: boolean; conflict?: boolean; rumor?: boolean } = {},
): Confidence {
  if (flags.conflict) return "disputed";
  if (flags.rumor || citations.length === 0) return "rumored";
  if (flags.officialPrimary && independentDomains(citations) >= 2) return "confirmed";
  return "reported";
}

export function confidenceAllowed(claimed: Confidence, citations: Citation[], officialPrimary: boolean): boolean {
  if (citations.length < 1) return claimed === "rumored";
  if (claimed === "disputed" || claimed === "rumored" || claimed === "reported") return true;
  return officialPrimary && independentDomains(citations) >= 2;
}
