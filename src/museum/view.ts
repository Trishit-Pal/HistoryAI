import type { Citation, Confidence, EraId, FieldChange, Figure, Kind, Layer, PublicationState } from "../domain/types";

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
  fieldChange?: FieldChange;
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
