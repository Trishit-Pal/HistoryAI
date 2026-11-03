import type { Citation, Confidence, Figure } from "./types";

export type RevisionBlob = {
  confidence?: Confidence;
  citations?: Citation[];
  publicationState?: string;
  title?: string;
  publicStory?: string;
  technicalAccount?: string;
  editorialNote?: string;
  figure?: Figure;
};

export type RevisionChange =
  | { field: "created" }
  | { field: "confidence"; from?: Confidence; to?: Confidence }
  | { field: "citations"; added: string[]; removed: string[] }
  | { field: "publicationState"; from: string; to: string }
  | { field: "text"; parts: ("title" | "publicStory" | "technicalAccount" | "editorialNote")[] }
  | { field: "figure" };

function publishers(citations: Citation[] | undefined): Map<string, string> {
  return new Map((citations ?? []).map((citation) => [citation.url, citation.publisher]));
}

export function describeRevision(prev: RevisionBlob | undefined, next: RevisionBlob): RevisionChange[] {
  if (!prev) return [{ field: "created" }];
  const changes: RevisionChange[] = [];
  if (prev.confidence !== next.confidence) {
    changes.push({ field: "confidence", from: prev.confidence, to: next.confidence });
  }
  const before = publishers(prev.citations);
  const after = publishers(next.citations);
  const added = [...after.entries()].filter(([url]) => !before.has(url)).map(([, name]) => name);
  const removed = [...before.entries()].filter(([url]) => !after.has(url)).map(([, name]) => name);
  if (added.length > 0 || removed.length > 0) changes.push({ field: "citations", added, removed });
  if ((prev.publicationState ?? "") !== (next.publicationState ?? "")) {
    changes.push({
      field: "publicationState",
      from: prev.publicationState ?? "",
      to: next.publicationState ?? "",
    });
  }
  const parts = (["title", "publicStory", "technicalAccount", "editorialNote"] as const).filter(
    (part) => (prev[part] ?? "") !== (next[part] ?? ""),
  );
  if (parts.length > 0) changes.push({ field: "text", parts });
  const prevFigure = JSON.stringify(prev.figure ?? null);
  const nextFigure = JSON.stringify(next.figure ?? null);
  if (prevFigure !== nextFigure) changes.push({ field: "figure" });
  return changes;
}
