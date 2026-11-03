import type { AtlasSourceId } from "./sources";

export type AtlasMetric = "compute" | "parameters";

/**
 * Columnar so 2,500 models stay small in the page payload. Every array has `count` entries
 * and the same index refers to the same model in all of them.
 */
export interface AtlasModels {
  count: number;
  names: string[];
  /** ISO date from Epoch, YYYY-MM-DD. */
  dates: string[];
  /** Fractional year, for placing the point on the year axis. */
  years: number[];
  /** log10 of training compute in FLOP, or null when Epoch gives no estimate. */
  logCompute: Array<number | null>;
  /** log10 of parameter count, or null when Epoch gives none. */
  logParameters: Array<number | null>;
  /** Index into AtlasSnapshot.domains. */
  domainIndex: number[];
  organizations: string[];
  /** The first https URL Epoch lists for the model. Always present. */
  links: string[];
  /** Epoch's own label for how sure it is: Confident, Likely, Speculative, Unknown, or "". */
  epochConfidence: string[];
  /** True for the models the atlas shows by default. */
  featured: boolean[];
  /** Plain-language reasons a featured model was chosen. Empty for the rest. */
  why: string[][];
}

export interface AtlasTotals {
  /** Rows in Epoch's file. */
  rows: number;
  /** Rows kept: dated, linked, and with compute or parameters. */
  plotted: number;
  withCompute: number;
  withParameters: number;
  /** Models shown by default. */
  featured: number;
}

export interface AtlasSnapshot {
  generatedAt: string;
  sourceId: AtlasSourceId;
  totals: AtlasTotals;
  domains: string[];
  models: AtlasModels;
}
