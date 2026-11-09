import type { AtlasMetric } from "./types";

/** The height axis's title: on the plot's back wall and in the legend under it. */
export const AXIS_TITLE: Record<AtlasMetric, string> = {
  compute: "Training compute, FLOP, log scale",
  parameters: "Parameters, log scale",
};

const NO_COMPUTE = "No estimate published";
const NO_PARAMETERS = "No count published";

const UNITS = ["", "K", "M", "B", "T"] as const;
const UNIT_STEP = 1_000;

/** 21.4 becomes "2.5 × 10^21 FLOP". */
export function formatCompute(log: number | null): string {
  if (log === null) return NO_COMPUTE;
  let exponent = Math.floor(log);
  let mantissa = Math.round(10 ** (log - exponent) * 10) / 10;
  if (mantissa >= 10) {
    mantissa = 1;
    exponent += 1;
  }
  return `${mantissa.toFixed(1)} × 10^${exponent} FLOP`;
}

function trimmed(value: number): string {
  return value >= 100 ? String(Math.round(value)) : String(Math.round(value * 10) / 10);
}

/** 11.24 becomes "175 B". */
export function formatParameters(log: number | null): string {
  if (log === null) return NO_PARAMETERS;
  let value = 10 ** log;
  let unit = 0;
  while (unit < UNITS.length - 1 && Math.round(value) >= UNIT_STEP) {
    value /= UNIT_STEP;
    unit += 1;
  }
  const text = trimmed(value);
  return UNITS[unit] ? `${text} ${UNITS[unit]}` : text;
}
