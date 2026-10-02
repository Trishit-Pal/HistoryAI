import { layoutHalls, type Hall, type PublicExhibit } from "../domain/layout";
import type { MemoryStore } from "../store/memory";
import type { MuseumNode } from "./view";

export function museumNodes(store: MemoryStore): MuseumNode[] {
  return store.publicExhibits().map((exhibit) => ({
    id: exhibit.id,
    title: exhibit.title,
    startYear: exhibit.startYear,
    endYear: exhibit.endYear,
    kind: exhibit.kind,
    publicStory: exhibit.publicStory,
    publicationState: exhibit.publicationState as MuseumNode["publicationState"],
    layer: exhibit.layer,
    eraId: exhibit.eraId,
    confidence: exhibit.confidence,
    citations: exhibit.citations ?? [],
    tags: exhibit.tags ?? [],
    editorialNote: exhibit.editorialNote,
    technicalAccount: exhibit.technicalAccount,
    incomplete: exhibit.incomplete,
    proseFlags: exhibit.proseFlags,
    figure: exhibit.figure,
  }));
}

export function asPublicExhibits(nodes: MuseumNode[]): PublicExhibit[] {
  return nodes.map((node) => ({
    id: node.id,
    title: node.title,
    kind: node.kind,
    startYear: node.startYear,
    publicationState: node.publicationState,
    eraId: node.eraId,
    layer: node.layer,
  }));
}

export function museumHalls(store: MemoryStore): Hall[] {
  return layoutHalls(asPublicExhibits(museumNodes(store)));
}
