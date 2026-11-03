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

export type Layer = "technical" | "context";

export type Confidence = "confirmed" | "reported" | "disputed" | "rumored";

export type EraId =
  | "era_0_precursors"
  | "era_1_founding"
  | "era_2_symbolic"
  | "era_3_first_winter"
  | "era_4_expert_systems"
  | "era_5_second_winter"
  | "era_6_statistical"
  | "era_7_deep_learning"
  | "era_8_transformers"
  | "era_9_generative"
  | "era_10_frontier";

export type Citation = {
  url: string;
  publisher: string;
  retrieved: string;
};

export type FieldChange = {
  before: string;
  after: string;
  citationUrls: string[];
};

export const FIGURE_LICENSES = [
  "PD-old",
  "PD-US-expired",
  "CC0-1.0",
  "CC-BY-4.0",
  "CC-BY-SA-4.0",
  "original",
] as const;

export type FigureLicense = (typeof FIGURE_LICENSES)[number];

export type Figure = {
  src: string;
  alt: string;
  credit: string;
  license: FigureLicense;
  sourceUrl: string;
  kind: "scan" | "redrawn";
  redrawnAfter?: string;
  sourceLabel?: string;
};

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
