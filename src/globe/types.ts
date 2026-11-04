export interface GlobeModel {
  name: string;
  date: string;
  year: number;
  logCompute: number;
  organizations: string[];
  link?: string;
  /** Set only when the Atlas snapshot has a point with this exact name. */
  atlasName?: string;
}

export interface GlobeCountry {
  country: string;
  lat: number;
  lon: number;
  labs: string[];
  /** Sorted by date. */
  models: GlobeModel[];
}

/** A model that set a new training-compute record; the multiplier is against the previous record. */
export type GlobeRecord = GlobeModel & { multiplier: number | null };

export interface GlobeSnapshot {
  generatedAt: string;
  cutoff: "2026-11-01";
  threshold: 23;
  countries: GlobeCountry[];
  multinational: GlobeModel[];
  records: GlobeRecord[];
}
