export type Kind =
  | "idea"
  | "system"
  | "institution"
  | "period"
  | "failure"
  | "turning_point"
  | "dataset"
  | "benchmark";

export type PublicationState = "draft" | "provisional" | "proposed" | "canon";

export type ClaimRole = "what_changed" | "capability" | "limit" | "failure" | "unknown";

export type ClaimStatus = "established" | "contested" | "retracted" | "unknown";

export type SourceKind =
  | "paper"
  | "technical_report"
  | "dataset_paper"
  | "benchmark_paper"
  | "peer_reviewed_retrospective"
  | "lab_release"
  | "model_card"
  | "benchmark_record";

export type EvolutionType = "INFLUENCED_BY" | "SUPERSEDED_BY" | "EVALUATED_ON" | "COMPONENT_OF";

export type Role = "editor" | "agent";

export type ViolationRule =
  | "invalid-shape"
  | "illegal-relation"
  | "source-rule"
  | "canon-incomplete"
  | "forbidden-transition"
  | "conflict"
  | "seed-aborted";

export type Violation = {
  path: string;
  rule: ViolationRule;
  message: string;
};

export type ProseFlag = {
  rule: "out-of-scope-prose";
  match: string;
};

export const PRIMARY_SOURCE_KINDS: readonly SourceKind[] = [
  "paper",
  "technical_report",
  "dataset_paper",
  "benchmark_paper",
  "peer_reviewed_retrospective",
];

export const CLAIM_ROLES: readonly ClaimRole[] = [
  "what_changed",
  "capability",
  "limit",
  "failure",
  "unknown",
];

export const KIND_BAND: readonly Kind[] = [
  "idea",
  "system",
  "failure",
  "turning_point",
  "dataset",
  "benchmark",
  "institution",
  "period",
];
