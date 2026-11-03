import type { Hall } from "../domain/layout";
import { describeRevision, type RevisionChange } from "../domain/revisions";
import type { FieldChange } from "../domain/types";
import { MemoryStore, type ChangelogLine, type MuseumSnapshot } from "../store/memory";
import { museumHalls, museumNodes } from "./payload";
import { relatedFor, type RelatedLine } from "./related";
import type { MuseumNode } from "./view";

export type RevisionView = {
  version: number;
  at: string;
  reason: string;
  fromSuggestion: boolean;
  changes: RevisionChange[];
};

export type ExhibitDetail = {
  node: MuseumNode;
  related: RelatedLine[];
  revisions: RevisionView[];
  fieldChange?: FieldChange;
  claims: { role: string; statement: string; status: string }[];
};

export type MuseumData = {
  nodes: MuseumNode[];
  halls: Hall[];
  changelog: ChangelogLine[];
  exhibits: Record<string, ExhibitDetail>;
  source: "live" | "archive";
  archivedAt?: string;
};

export function buildMuseumData(
  snapshot: MuseumSnapshot,
  meta: { source: "live" | "archive"; archivedAt?: string },
): MuseumData {
  const store = MemoryStore.fromSnapshot(snapshot);
  const nodes = museumNodes(store);
  const publicIds = new Set(nodes.map((node) => node.id));
  const publicLinks = snapshot.evolution.filter((link) => publicIds.has(link.fromId) && publicIds.has(link.toId));
  const exhibits: Record<string, ExhibitDetail> = {};
  for (const node of nodes) {
    const versions = store.versions(node.id);
    exhibits[node.id] = {
      node,
      fieldChange: node.fieldChange,
      related: relatedFor(node.id, publicLinks, nodes),
      revisions: versions.map((entry, index) => ({
        version: entry.version,
        at: entry.at,
        reason: entry.reason,
        fromSuggestion: Boolean(entry.suggestionId),
        changes: describeRevision(index === 0 ? undefined : versions[index - 1]?.blob, entry.blob),
      })),
      claims: store
        .claimsFor(node.id)
        .filter((claim) => claim.publicationState === "canon" || claim.publicationState === "provisional")
        .map((claim) => ({
        role: claim.role,
        statement: claim.statement,
        status: claim.status,
      })),
    };
  }
  return {
    nodes,
    halls: museumHalls(store),
    changelog: store.changelog().filter((line) => publicIds.has(line.nodeId)),
    exhibits,
    source: meta.source,
    archivedAt: meta.archivedAt,
  };
}
