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
    summary: "Babbage's engine, Boole's logic, Turing, Shannon, the McCulloch–Pitts neuron and Wiener's Cybernetics.",
  },
  {
    id: "era_1_founding", slug: "founding", label: "Formal founding", startYear: 1950, endYear: 1956, mood: "open",
    summary: "Turing's imitation game and the Dartmouth project whose 1955 proposal named artificial intelligence.",
  },
  {
    id: "era_2_symbolic", slug: "symbolic", label: "Symbolic golden age", startYear: 1956, endYear: 1974, mood: "open",
    summary: "Rosenblatt's Perceptron, DENDRAL and ELIZA, alongside the ALPAC report and the limits of single-layer nets.",
  },
  {
    id: "era_3_first_winter", slug: "first-winter", label: "First AI winter", startYear: 1974, endYear: 1980, mood: "winter",
    summary: "The Lighthill Report found that no part of the field had produced the major impact then promised.",
  },
  {
    // No exhibits since the November 2026 audit, so this era has no hall and no summary.
    id: "era_4_expert_systems", slug: "expert-systems", label: "Expert systems boom", startYear: 1980, endYear: 1987, mood: "open",
  },
  {
    // No exhibits since the November 2026 audit, so this era has no hall and no summary.
    id: "era_5_second_winter", slug: "second-winter", label: "Second AI winter", startYear: 1987, endYear: 1993, mood: "winter",
  },
  {
    id: "era_6_statistical", slug: "statistical", label: "Statistical renaissance", startYear: 1993, endYear: 2011, mood: "open",
    summary: "Machines beat human champions at chess and on Jeopardy!",
  },
  {
    id: "era_7_deep_learning", slug: "deep-learning", label: "Deep learning", startYear: 2012, endYear: 2016, mood: "dense",
    summary: "AlexNet won ImageNet, GANs were introduced, AlphaGo beat Lee Sedol, and Microsoft pulled its Tay chatbot.",
  },
  {
    id: "era_8_transformers", slug: "transformers", label: "Transformer era", startYear: 2017, endYear: 2019, mood: "dense",
    summary: "“Attention Is All You Need” introduced the Transformer, then BERT and GPT-2 pre-trained it on plain text.",
  },
  {
    id: "era_9_generative", slug: "generative", label: "Generative boom", startYear: 2020, endYear: 2022, mood: "dense",
    summary: "GPT-3, Wu Dao 2.0 and Chinchilla, AlphaFold2's protein structures, and ChatGPT as a free research preview.",
  },
  {
    id: "era_10_frontier", slug: "frontier", label: "Frontier", startYear: 2023, endYear: null, mood: "dense",
    summary: "LLaMA and GPT-4 to o1, DeepSeek-R1 and GPT-6 Astra, with a statement on AI risk, the EU AI Act and Nobels.",
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
