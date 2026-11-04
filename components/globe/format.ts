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

/** "by 1 Nov 2026" for the last year, where the data stops; "by the end of 2023" otherwise. */
export function byYear(year: number): string {
  return year === LAST_YEAR ? "by 1 Nov 2026" : `by the end of ${year}`;
}

/** The year the first model at or above the threshold appears, in any country or none. */
export function firstYear(snapshot: GlobeSnapshot): number {
  const all = [...snapshot.countries.flatMap((c) => c.models), ...snapshot.multinational];
  return Math.min(...all.map((model) => model.year));
}

export interface Growth {
  /** Whole orders of magnitude the largest run has grown since the first record. */
  power: number;
  /** True when the growth is more than `power` (the exponent was rounded down). */
  more: boolean;
  since: number;
}

export interface CountLine {
  text: string;
  growth: Growth | null;
}

/** The live line under the slider. */
export function countLine(snapshot: GlobeSnapshot, year: number): CountLine {
  const stats = statsAt(snapshot, year);
  if (stats.models === 0) {
    return { text: `No model at this scale yet. The first arrives in ${firstYear(snapshot)}.`, growth: null };
  }
  const base = snapshot.records[0];
  const span = stats.largest && base ? stats.largest.logCompute - base.logCompute : null;
  // Three decimals in the data, so anything past the third place is float noise, not growth.
  const power = span === null ? 0 : Math.floor(span + 1e-9);
  return {
    text: `${year}: ${plural(stats.labs, "lab", "labs")} in ${plural(stats.countries, "country", "countries")}`,
    growth: span === null || !base ? null : { power, more: span - power > 1e-9, since: base.year },
  };
}
