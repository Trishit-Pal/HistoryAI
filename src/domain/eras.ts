import type { EraId } from "./types";

export type EraDefinition = {
  id: EraId;
  label: string;
  startYear: number;
  endYear: number | null;
  mood: "open" | "winter" | "dense";
};

export const ERAS: readonly EraDefinition[] = [
  { id: "era_0_precursors", label: "Precursors", startYear: Number.NEGATIVE_INFINITY, endYear: 1949, mood: "open" },
  { id: "era_1_founding", label: "Formal founding", startYear: 1950, endYear: 1956, mood: "open" },
  { id: "era_2_symbolic", label: "Symbolic golden age", startYear: 1956, endYear: 1974, mood: "open" },
  { id: "era_3_first_winter", label: "First AI winter", startYear: 1974, endYear: 1980, mood: "winter" },
  { id: "era_4_expert_systems", label: "Expert systems boom", startYear: 1980, endYear: 1987, mood: "open" },
  { id: "era_5_second_winter", label: "Second AI winter", startYear: 1987, endYear: 1993, mood: "winter" },
  { id: "era_6_statistical", label: "Statistical renaissance", startYear: 1993, endYear: 2011, mood: "open" },
  { id: "era_7_deep_learning", label: "Deep learning", startYear: 2012, endYear: 2016, mood: "dense" },
  { id: "era_8_transformers", label: "Transformer era", startYear: 2017, endYear: 2019, mood: "dense" },
  { id: "era_9_generative", label: "Generative boom", startYear: 2020, endYear: 2022, mood: "dense" },
  { id: "era_10_frontier", label: "Frontier", startYear: 2023, endYear: null, mood: "dense" },
];

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
