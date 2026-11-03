import { EXCLUDES, PINS } from "./mapping";
import { type SelectionCandidate, selectFeatured } from "./select";
import type { AtlasSnapshot } from "./types";

type Row = Readonly<Record<string, string>>;

/** Lanes the scene can draw before it runs out of room; the rest share an "Other" lane. */
const NAMED_DOMAIN_LANES = 7;
const OTHER_LABEL = "Other";
const NOT_STATED_LABEL = "Not stated";
const LOG_DECIMALS = 3;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

interface Candidate {
  name: string;
  date: string;
  year: number;
  logCompute: number | null;
  logParameters: number | null;
  domain: string;
  organization: string;
  link: string;
  epochConfidence: string;
  /** Inputs to the selector. Used at build time only; they are not shipped to the browser. */
  citations: number;
  tags: string[];
  frontier: boolean;
  foundation: boolean;
  paper: string;
}

function round(value: number): number {
  const factor = 10 ** LOG_DECIMALS;
  return Math.round(value * factor) / factor;
}

/** An https link with a real host and no credentials in it, in normal form, or nothing. */
function safeHttpsUrl(text: string): string | undefined {
  // The URL parser forgives "https:///path" by reading "path" as the host; a real link has a host first.
  if (!/^https:\/\/[^/\s?#]/i.test(text)) return undefined;
  try {
    const url = new URL(text);
    if (url.protocol !== "https:" || !url.hostname || url.username || url.password) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

/** The first usable https URL in a field that may hold several, separated by commas or whitespace. */
export function firstHttpsUrl(field: string): string | undefined {
  for (const part of field.split(/[\s,]+/)) {
    const url = safeHttpsUrl(part.trim());
    if (url) return url;
  }
  return undefined;
}

/** 2020-07-02 becomes 2020.5: the year plus how far through it the date falls. */
export function toFractionalYear(date: string): number | undefined {
  const match = ISO_DATE.exec(date.trim());
  if (!match) return undefined;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const moment = Date.UTC(year, month - 1, day);
  const check = new Date(moment);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return undefined;
  }
  const start = Date.UTC(year, 0, 1);
  const end = Date.UTC(year + 1, 0, 1);
  return round(year + (moment - start) / (end - start));
}

function logOf(field: string | undefined): number | null {
  const value = Number((field ?? "").trim());
  return Number.isFinite(value) && value > 0 ? round(Math.log10(value)) : null;
}

function toCandidate(row: Row): Candidate | undefined {
  const date = (row["Publication date"] ?? "").trim();
  const year = toFractionalYear(date);
  const link = firstHttpsUrl(row.Link ?? "");
  if (year === undefined || !link) return undefined;

  const logCompute = logOf(row["Training compute (FLOP)"]);
  const logParameters = logOf(row.Parameters);
  if (logCompute === null && logParameters === null) return undefined;

  return {
    name: (row.Model ?? "").trim(),
    date,
    year,
    logCompute,
    logParameters,
    domain: (row.Domain ?? "").split(",")[0].trim(),
    organization: (row.Organization ?? "").trim(),
    link,
    epochConfidence: (row.Confidence ?? "").trim(),
    citations: citationCount(row.Citations),
    tags: (row["Notability criteria"] ?? "").split(",").map((tag) => tag.trim()).filter(Boolean),
    frontier: isTrue(row["Frontier model"]),
    foundation: isTrue(row["Foundation model"]),
    paper: (row.Reference ?? "").trim().toLowerCase(),
  };
}

function isTrue(field: string | undefined): boolean {
  return (field ?? "").trim().toLowerCase() === "true";
}

function citationCount(field: string | undefined): number {
  const value = Number((field ?? "").trim());
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function toSelection(candidate: Candidate): SelectionCandidate {
  return {
    name: candidate.name,
    year: candidate.year,
    logCompute: candidate.logCompute,
    citations: candidate.citations,
    tags: candidate.tags,
    frontier: candidate.frontier,
    foundation: candidate.foundation,
    paper: candidate.paper,
  };
}

function laneLabels(candidates: readonly Candidate[]): string[] {
  const counts = new Map<string, number>();
  for (const { domain } of candidates) {
    if (domain) counts.set(domain, (counts.get(domain) ?? 0) + 1);
  }
  const named = [...counts.entries()]
    .sort(([a, countA], [b, countB]) => countB - countA || a.localeCompare(b))
    .slice(0, NAMED_DOMAIN_LANES)
    .map(([domain]) => domain);
  const hasOther = counts.size > named.length;
  const hasBlank = candidates.some(({ domain }) => !domain);
  return [...named, ...(hasOther ? [OTHER_LABEL] : []), ...(hasBlank ? [NOT_STATED_LABEL] : [])];
}

function laneIndex(domain: string, labels: readonly string[]): number {
  if (!domain) return labels.indexOf(NOT_STATED_LABEL);
  const named = labels.indexOf(domain);
  return named >= 0 ? named : labels.indexOf(OTHER_LABEL);
}

/**
 * Turns Epoch's rows into the compact snapshot the atlas draws. A model is kept only if it has a
 * real date, a real https source link, and at least one metric. Missing metrics stay null. Every
 * plotted model stays in the snapshot; `featured` marks the ones the atlas shows by default.
 */
export function buildAtlas(rows: readonly Row[], meta: { generatedAt: string }): AtlasSnapshot {
  const kept = rows
    .map(toCandidate)
    .filter((candidate): candidate is Candidate => candidate !== undefined)
    .sort((a, b) => a.year - b.year || a.name.localeCompare(b.name));

  const domains = laneLabels(kept);
  const { featured, why } = selectFeatured(kept.map(toSelection), { pins: PINS, excludes: EXCLUDES });

  return {
    generatedAt: meta.generatedAt,
    sourceId: "epoch-ai-models",
    totals: {
      rows: rows.length,
      plotted: kept.length,
      withCompute: kept.filter((c) => c.logCompute !== null).length,
      withParameters: kept.filter((c) => c.logParameters !== null).length,
      featured: featured.filter(Boolean).length,
    },
    domains,
    models: {
      count: kept.length,
      names: kept.map((c) => c.name),
      dates: kept.map((c) => c.date),
      years: kept.map((c) => c.year),
      logCompute: kept.map((c) => c.logCompute),
      logParameters: kept.map((c) => c.logParameters),
      domainIndex: kept.map((c) => laneIndex(c.domain, domains)),
      organizations: kept.map((c) => c.organization),
      links: kept.map((c) => c.link),
      epochConfidence: kept.map((c) => c.epochConfidence),
      featured,
      why,
    },
  };
}
