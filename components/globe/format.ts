import { statsAt } from "../../src/globe/stats";
import type { GlobeSnapshot } from "../../src/globe/types";

export const FIRST_YEAR = 2018;
export const LAST_YEAR = 2026;

/** The slider's year, said in full: 2026 stops at the cutoff. */
export function yearLabel(year: number): string {
  return year === LAST_YEAR ? "2026, to 1 November" : String(year);
}

/** 23.857 becomes "10^23.9". */
export function flopPower(logCompute: number): string {
  return (Math.round(logCompute * 10) / 10).toFixed(1);
}

/** ×7.66 becomes "×7.7"; ×17.4 becomes "×17". */
export function times(multiplier: number): string {
  return `×${multiplier >= 10 ? Math.round(multiplier) : (Math.round(multiplier * 10) / 10).toFixed(1)}`;
}

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

export interface CountLine {
  text: string;
  /** Orders of magnitude the largest run has grown since the first record (2012). */
  growth: number | null;
}

/** The live line under the slider. */
export function countLine(snapshot: GlobeSnapshot, year: number): CountLine {
  const stats = statsAt(snapshot, year);
  if (stats.models === 0) {
    const first = Math.min(...snapshot.countries.flatMap((c) => c.models.map((m) => m.year)));
    return { text: `No model at this scale yet. The first arrives in ${first}.`, growth: null };
  }
  const base = snapshot.records[0];
  const growth = stats.largest && base ? Math.floor(stats.largest.logCompute - base.logCompute) : null;
  return {
    text: `${year}: ${plural(stats.labs, "lab", "labs")} in ${plural(stats.countries, "country", "countries")}`,
    growth,
  };
}
