import { ERAS, eraForYear } from "../domain/eras";
import type { EraId } from "../domain/types";

/** How many models the atlas shows by default. */
export const FEATURED_COUNT = 80;

/** A model counts as a compute record only if it beats the previous record by this much in log10 (about 2x). */
export const RECORD_STEP = 0.3;

/** Two points closer than this on the plot (years, then log10 compute) are one dot too many. */
const OVERLAP_YEARS = 0.35;
const OVERLAP_LOG = 0.7;

/** Citations stop adding score at 10^5, so one runaway paper cannot swamp everything else. */
const CITATION_CEILING_LOG = 5;
/** Epoch tags nearly every old model "frontier"; the flags only mean something from here. */
const MODERN_FROM = 2012;

const REASON_PIN = "Chosen by the museum";
const REASON_RECORD = "Largest training run of its day";
const REASON_FALLBACK = "Notable for its era";
const MAX_REASONS = 3;

/** Weights for the score. Epoch's notability tags are its own editorial judgment of why a model matters. */
export const WEIGHTS = {
  citations: 1.2,
  frontier: 0.6,
  foundation: 0.4,
  tags: {
    "Historical significance": 0.5,
    "Significant use": 0.6,
    "Highly cited": 0.3,
    "Training cost": 0.2,
    "SOTA improvement": 0.15,
    Discretionary: 0.05,
  } as Record<string, number>,
} as const;

/** The fewest models each era gets, so the early decades are not drowned by the recent ones. Filled by score. */
export const ERA_FLOORS: Partial<Record<EraId, number>> = {
  era_1_founding: 2,
  era_2_symbolic: 4,
  era_3_first_winter: 2,
  era_4_expert_systems: 3,
  era_5_second_winter: 3,
  era_6_statistical: 6,
  era_7_deep_learning: 9,
  era_8_transformers: 9,
  era_9_generative: 11,
  era_10_frontier: 14,
};

export interface SelectionCandidate {
  name: string;
  /** Fractional year of publication. */
  year: number;
  logCompute: number | null;
  /** Epoch's citation count, 0 when it has none. */
  citations: number;
  /** Epoch's notability reasons. */
  tags: readonly string[];
  frontier: boolean;
  foundation: boolean;
  /** Epoch's reference title, lower-cased. Rows of one paper share it. "" when unknown. */
  paper: string;
}

export interface SelectionOptions {
  /** Models always shown, whether or not they would score well. */
  pins: readonly string[];
  /** Models never shown. Wins over a pin. */
  excludes: readonly string[];
  count?: number;
  floors?: Partial<Record<EraId, number>>;
}

export interface Selection {
  /** One flag per candidate, in the candidates' order. */
  featured: boolean[];
  /** One list of plain-language reasons per candidate. Empty for a model that was not chosen. */
  why: string[][];
}

/** How significant a model looks from Epoch's own data. Higher is better. */
export function scoreOf(candidate: SelectionCandidate): number {
  let score = 0;
  if (candidate.citations > 0) {
    score += Math.min(1, Math.log10(1 + candidate.citations) / CITATION_CEILING_LOG) * WEIGHTS.citations;
  }
  for (const tag of candidate.tags) score += WEIGHTS.tags[tag] ?? 0;
  if (candidate.year >= MODERN_FROM) {
    if (candidate.frontier) score += WEIGHTS.frontier;
    if (candidate.foundation) score += WEIGHTS.foundation;
  }
  return score;
}

/** Best score first; among equals the larger model, then the older, then by name, so the order never wavers. */
const byScoreThenSize = (candidates: readonly SelectionCandidate[]) => (a: number, b: number) =>
  scoreOf(candidates[b]) - scoreOf(candidates[a]) ||
  (candidates[b].logCompute ?? Number.NEGATIVE_INFINITY) - (candidates[a].logCompute ?? Number.NEGATIVE_INFINITY) ||
  candidates[a].year - candidates[b].year ||
  candidates[a].name.localeCompare(candidates[b].name);

function citationReason(citations: number): string | undefined {
  if (citations >= 10_000) return `${Math.round(citations / 1000)}k citations`;
  if (citations >= 1000) return `${(citations / 1000).toFixed(1)}k citations`;
  return undefined;
}

function reasonsFor(candidate: SelectionCandidate, pinned: boolean, record: boolean): string[] {
  const reasons: string[] = [];
  if (pinned) reasons.push(REASON_PIN);
  if (record) reasons.push(REASON_RECORD);
  const cited = citationReason(candidate.citations);
  if (cited) reasons.push(cited);
  if (candidate.tags.includes("Historical significance")) reasons.push("Historically significant");
  if (candidate.tags.includes("Significant use")) reasons.push("Widely used");
  if (candidate.year >= MODERN_FROM && candidate.frontier) reasons.push("Frontier model of its time");
  if (candidate.year >= MODERN_FROM && candidate.foundation) reasons.push("Foundation model");
  return (reasons.length > 0 ? reasons : [REASON_FALLBACK]).slice(0, MAX_REASONS);
}

/**
 * Picks the models the atlas shows by default. The order of the rules matters:
 * 1. One showable row per paper survives (pinned rows always; else the best score, the larger model on a tie).
 * 2. Pins go in, then every model that set a clear compute record.
 * 3. Each era is topped up to its minimum, best score first.
 * 4. The rest of the places go to the best scores.
 * Steps 3 and 4 skip any model that would sit on top of one already chosen. It is deterministic and
 * throws, instead of quietly dropping models, if the pins and records alone do not fit.
 */
export function selectFeatured(candidates: readonly SelectionCandidate[], options: SelectionOptions): Selection {
  const count = options.count ?? FEATURED_COUNT;
  const floors = options.floors ?? ERA_FLOORS;
  const pinned = new Set(options.pins);
  const excluded = new Set(options.excludes);
  const rank = byScoreThenSize(candidates);

  // 1. One row per paper. The row kept must be one that could be shown (not excluded, and with a
  // compute estimate unless pinned), or a paper whose best-scoring row is unusable would vanish.
  // Pinned rows are never dropped.
  const dropped = new Set<number>();
  const papers = new Map<string, number[]>();
  candidates.forEach((candidate, index) => {
    if (candidate.paper) papers.set(candidate.paper, [...(papers.get(candidate.paper) ?? []), index]);
  });
  for (const rows of papers.values()) {
    const showable = rows.filter(
      (i) => !excluded.has(candidates[i].name) && (pinned.has(candidates[i].name) || candidates[i].logCompute !== null),
    );
    if (showable.length === 0) continue;
    const keep = showable.find((i) => pinned.has(candidates[i].name)) ?? [...showable].sort(rank)[0];
    for (const i of rows) if (i !== keep && !pinned.has(candidates[i].name)) dropped.add(i);
  }

  const usable = (i: number) => !excluded.has(candidates[i].name) && !dropped.has(i);
  const chosen = new Set<number>();
  const recordSet = new Set<number>();

  // 2. Pins, then compute records.
  const pinIndexes = candidates.flatMap((c, i) => (usable(i) && pinned.has(c.name) ? [i] : []));
  for (const i of pinIndexes) chosen.add(i);

  let best = Number.NEGATIVE_INFINITY;
  const byDate = candidates
    .map((_, i) => i)
    .filter((i) => usable(i) && candidates[i].logCompute !== null)
    .sort((a, b) => candidates[a].year - candidates[b].year || candidates[a].name.localeCompare(candidates[b].name));
  for (const i of byDate) {
    const compute = candidates[i].logCompute as number;
    if (compute >= best + RECORD_STEP) {
      best = compute;
      recordSet.add(i);
      chosen.add(i);
    }
  }

  if (chosen.size > count) {
    throw new Error(
      `Pins (${pinIndexes.length}) plus compute records (${recordSet.size}) need ${chosen.size} places but the target is ${count}. Remove a pin or raise RECORD_STEP.`,
    );
  }

  const overlaps = (i: number) => {
    const { year, logCompute } = candidates[i];
    if (logCompute === null) return false;
    for (const other of chosen) {
      const o = candidates[other];
      if (o.logCompute !== null && Math.abs(o.year - year) < OVERLAP_YEARS && Math.abs(o.logCompute - logCompute) < OVERLAP_LOG) {
        return true;
      }
    }
    return false;
  };
  const pool = candidates
    .map((_, i) => i)
    .filter((i) => usable(i) && candidates[i].logCompute !== null)
    .sort(rank);
  const eraOf = (i: number) => eraForYear(Math.floor(candidates[i].year)).id;
  const inEra = (era: EraId) => [...chosen].filter((i) => eraOf(i) === era).length;

  // 3. Era minimums.
  for (const era of ERAS) {
    const floor = floors[era.id] ?? 0;
    for (const i of pool) {
      if (chosen.size >= count || inEra(era.id) >= floor) break;
      if (eraOf(i) === era.id && !chosen.has(i) && !overlaps(i)) chosen.add(i);
    }
  }

  // 4. The rest by score.
  for (const i of pool) {
    if (chosen.size >= count) break;
    if (!chosen.has(i) && !overlaps(i)) chosen.add(i);
  }

  return {
    featured: candidates.map((_, i) => chosen.has(i)),
    why: candidates.map((c, i) => (chosen.has(i) ? reasonsFor(c, pinned.has(c.name), recordSet.has(i)) : [])),
  };
}
