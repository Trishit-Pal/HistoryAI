import { highestAllowedConfidence } from "../domain/confidence";
import type { Citation, Confidence, EraId } from "../domain/types";
import type { MemoryStore } from "../store/memory";

export type RoutingDecision = "auto_publish" | "human_review" | "hold_unpublished";

export type Candidate = {
  id: string;
  title: string;
  summary: string;
  startYear: number;
  citations: Citation[];
  officialPrimary?: boolean;
  conflict?: boolean;
  rumor?: boolean;
  impact?: "routine_release" | "high" | "low";
  harm?: boolean;
  legal?: boolean;
  namedPersonEthics?: boolean;
  eraId?: EraId;
  tags?: string[];
  editorialNote?: string;
};

export type RoutedItem = {
  confidence: Confidence;
  routing_decision: RoutingDecision;
  publicationState?: "provisional";
};

export function routeCandidate(candidate: Candidate): RoutedItem {
  let confidence = highestAllowedConfidence(candidate.citations, {
    officialPrimary: candidate.officialPrimary,
    conflict: candidate.conflict,
    rumor: candidate.rumor || (candidate.citations.length <= 1 && !candidate.officialPrimary),
  });
  if (confidence === "confirmed" && !candidate.officialPrimary) confidence = "reported";
  if (candidate.conflict) confidence = "disputed";

  if (candidate.harm || candidate.legal || candidate.namedPersonEthics) {
    return { confidence, routing_decision: "human_review" };
  }
  if (confidence === "rumored") {
    return { confidence, routing_decision: "hold_unpublished" };
  }
  if (confidence === "disputed") {
    return { confidence, routing_decision: "human_review" };
  }
  if (confidence === "confirmed" && candidate.impact === "routine_release") {
    return { confidence, routing_decision: "auto_publish", publicationState: "provisional" };
  }
  return { confidence, routing_decision: "human_review" };
}

export function applyRouted(store: MemoryStore, candidate: Candidate, routed: RoutedItem) {
  if (routed.routing_decision !== "auto_publish") {
    return { ok: false as const, unpublished: true, routed };
  }
  return {
    ...store.apply(
      {
        exhibit: {
          id: candidate.id,
          title: candidate.title,
          kind: "system",
          startYear: candidate.startYear,
          publicStory: candidate.summary,
          publicationState: "provisional",
          incomplete: true,
          layer: "context",
          eraId: candidate.eraId ?? "era_10_frontier",
          confidence: routed.confidence,
          citations: candidate.citations,
          tags: candidate.tags ?? ["routine_release"],
          officialPrimary: candidate.officialPrimary,
          editorialNote: candidate.editorialNote,
        },
      },
      "agent",
    ),
    unpublished: false,
    routed,
  };
}
