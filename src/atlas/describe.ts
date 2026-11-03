import { formatCompute, formatParameters } from "./format";
import type { AtlasMetric, AtlasModels, AtlasSnapshot, AtlasTotals } from "./types";

export interface ModelFacts {
  name: string;
  date: string;
  year: number;
  organization: string;
  domain: string;
  compute: string;
  parameters: string;
  /** Epoch's own rating of how sure it is. This is not the museum's confidence word. */
  epochConfidence: string;
  /** Where Epoch says the model comes from. Always https. */
  link: string;
  /** Why the atlas features it. Empty for a model that is not featured. */
  why: string[];
}

const NOT_STATED = "Not stated";
const NOT_RATED = "Not rated";

/** Epoch separates several organisations with a bare comma; read them as a list. */
function spacedList(value: string): string {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

/** One model's row from the snapshot's columns, worded for a reader. */
export function describeModel(atlas: AtlasSnapshot, index: number): ModelFacts {
  const { models, domains } = atlas;
  return {
    name: models.names[index],
    date: models.dates[index],
    year: Math.floor(models.years[index]),
    organization: spacedList(models.organizations[index]) || NOT_STATED,
    domain: domains[models.domainIndex[index]] ?? NOT_STATED,
    compute: formatCompute(models.logCompute[index]),
    parameters: formatParameters(models.logParameters[index]),
    epochConfidence: models.epochConfidence[index] || NOT_RATED,
    link: models.links[index],
    why: models.why[index] ?? [],
  };
}

const METRIC_FIGURE: Record<AtlasMetric, string> = {
  compute: "training compute estimate",
  parameters: "parameter count",
};

/** How many featured models have a value for the measure, so the page can say how many dots it draws. */
export function featuredDrawn(models: Pick<AtlasModels, "featured" | "logCompute" | "logParameters">, metric: AtlasMetric): number {
  const column = metric === "compute" ? models.logCompute : models.logParameters;
  return models.featured.filter((isFeatured, index) => isFeatured && column[index] !== null).length;
}

/** Whether a model is on the plot right now: featured, or any model while "Show all" is on. */
export function isDrawn(featured: readonly boolean[], index: number | null, showAll: boolean): boolean {
  if (index === null || index < 0 || index >= featured.length) return false;
  return showAll || featured[index];
}

interface CoverageInput {
  metric: AtlasMetric;
  totals: AtlasTotals;
  showAll: boolean;
  /** Featured models drawn for this measure. */
  drawn: number;
}

/** One honest sentence about what the plot is showing and what it is leaving out. */
export function describeCoverage({ metric, totals, showAll, drawn }: CoverageInput): string {
  const measured = (metric === "compute" ? totals.withCompute : totals.withParameters).toLocaleString("en-US");
  const have = `models in Epoch AI’s data that have a date, a source link and a ${METRIC_FIGURE[metric]}`;
  if (showAll) return `Showing all ${measured} ${have}. The ${drawn} most significant are drawn larger.`;
  return `Showing the ${drawn} most significant of the ${measured} ${have}. Turn on ‘Show all models’ to see the rest.`;
}
