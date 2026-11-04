import type { EraId } from "./types";

export type EraDefinition = {
  id: EraId;
  slug: string;
  label: string;
  startYear: number;
  endYear: number | null;
  mood: "open" | "winter" | "dense";
  /** One neutral line, backed by the era's exhibits, shown under the era title on the home timeline. */
  summary?: string;
};

export const ERAS: readonly EraDefinition[] = [
  {
    id: "era_0_precursors", slug: "precursors", label: "Precursors", startYear: Number.NEGATIVE_INFINITY, endYear: 1949, mood: "open",
    summary: "Calculating engines, logic, computability and information theory that later AI work built on.",
  },
  {
    id: "era_1_founding", slug: "founding", label: "Formal founding", startYear: 1950, endYear: 1956, mood: "open",
    summary: "Turing's imitation game and the 1956 Dartmouth project that gave the field its name.",
  },
  {
    id: "era_2_symbolic", slug: "symbolic", label: "Symbolic golden age", startYear: 1956, endYear: 1974, mood: "open",
    summary: "Perceptrons, DENDRAL and ELIZA, alongside the ALPAC report and the limits of single-layer nets.",
  },
  {
    id: "era_3_first_winter", slug: "first-winter", label: "First AI winter", startYear: 1974, endYear: 1980, mood: "winter",
    summary: "The Lighthill Report led to deep UK funding cuts as promises met the limits of symbolic AI.",
  },
  {
    id: "era_4_expert_systems", slug: "expert-systems", label: "Expert systems boom", startYear: 1980, endYear: 1987, mood: "open",
    summary: "AI became a commercial market, with 1985 sales put at about $150 million a year.",
  },
  {
    id: "era_5_second_winter", slug: "second-winter", label: "Second AI winter", startYear: 1987, endYear: 1993, mood: "winter",
    summary: "Cheaper workstations caught up, and the market for dedicated LISP machines collapsed.",
  },
  {
    id: "era_6_statistical", slug: "statistical", label: "Statistical renaissance", startYear: 1993, endYear: 2011, mood: "open",
    summary: "Machines beat human champions at chess and on Jeopardy!",
  },
  {
    id: "era_7_deep_learning", slug: "deep-learning", label: "Deep learning", startYear: 2012, endYear: 2016, mood: "dense",
    summary: "Neural networks won at ImageNet and Go, and deployed systems failed in public.",
  },
  {
    id: "era_8_transformers", slug: "transformers", label: "Transformer era", startYear: 2017, endYear: 2019, mood: "dense",
    summary: "The Transformer architecture was introduced in “Attention Is All You Need”.",
  },
  {
    id: "era_9_generative", slug: "generative", label: "Generative boom", startYear: 2020, endYear: 2022, mood: "dense",
    summary: "AlphaFold2 predicted protein structures, and ChatGPT launched as a free research preview.",
  },
  {
    id: "era_10_frontier", slug: "frontier", label: "Frontier", startYear: 2023, endYear: null, mood: "dense",
    summary: "Risk statements, the EU AI Act, Nobel recognition and an open debate about a new winter.",
  },
];

export function eraBySlug(slug: string): EraDefinition | undefined {
  return ERAS.find((era) => era.slug === slug);
}

export function eraById(id: EraId): EraDefinition {
  const found = ERAS.find((era) => era.id === id);
  if (!found) throw new Error(`Unknown era ${id}`);
  return found;
}

export function eraForYear(year: number): EraDefinition {
  if (year <= 1949) return eraById("era_0_precursors");
  if (year <= 1956) return eraById("era_1_founding");
  if (year <= 1974) return eraById("era_2_symbolic");
  if (year <= 1980) return eraById("era_3_first_winter");
  if (year <= 1987) return eraById("era_4_expert_systems");
  if (year <= 1993) return eraById("era_5_second_winter");
  if (year <= 2011) return eraById("era_6_statistical");
  if (year <= 2016) return eraById("era_7_deep_learning");
  if (year <= 2019) return eraById("era_8_transformers");
  if (year <= 2022) return eraById("era_9_generative");
  return eraById("era_10_frontier");
}
