import type { Citation, Confidence, EraId, Figure, Kind, Layer, PublicationState } from "../domain/types";

export type MuseumNode = {
  id: string;
  title: string;
  startYear: number;
  endYear?: number;
  kind: Kind;
  publicStory: string;
  publicationState: Extract<PublicationState, "canon" | "provisional">;
  layer: Layer;
  eraId?: EraId;
  confidence?: Confidence;
  citations: Citation[];
  tags: string[];
  editorialNote?: string;
  technicalAccount?: string;
  incomplete: boolean;
  proseFlags: { rule: string; match: string }[];
  figure?: Figure;
};

export function cameraMove(reduced: boolean): "snap" | "tween" {
  return reduced ? "snap" : "tween";
}

export function chooseView(opts: { webgl: boolean; reducedMotion?: boolean }): "halls" | "flatland" {
  if (!opts.webgl) return "flatland";
  return "halls";
}

export function nodeIds(nodes: MuseumNode[]): string[] {
  return [...nodes.map((node) => node.id)].sort();
}

const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "of",
  "and",
  "or",
  "to",
  "in",
  "on",
  "for",
  "is",
  "what",
  "who",
  "how",
]);

export type MuseumAnswer = {
  summary: string;
  sources: string[];
  id?: string;
  confidence?: Confidence;
  editorialNote?: string;
};

export function askMuseum(query: string, nodes: MuseumNode[]): MuseumAnswer {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 2 && !STOPWORDS.has(term));
  const empty: MuseumAnswer = { summary: "The museum has no matching exhibit.", sources: [] };
  if (terms.length === 0) return empty;
  const match = nodes.find((node) => {
    const hay = `${node.title} ${node.publicStory} ${node.tags.join(" ")}`.toLowerCase();
    return terms.every((term) => new RegExp(`\\b${term}\\b`).test(hay));
  });
  if (!match) return empty;
  return {
    id: match.id,
    summary: match.publicStory,
    sources: match.citations.map((citation) => citation.url),
    confidence: match.confidence,
    editorialNote: match.editorialNote,
  };
}
