import type { AtlasMetric } from "./types";

/** How long the dots take to glide from one measure to the other. */
export const BLEND_SECONDS = 0.7;

/** Which metric the scene is leaving, which it is heading to, and how far along it is (0 to 1). */
export interface Blend {
  from: AtlasMetric;
  to: AtlasMetric;
  mix: number;
  /** Goes up on every retarget, so a drawing loop can tell something changed even when mix is already 1. */
  version: number;
}

export function steady(metric: AtlasMetric): Blend {
  return { from: metric, to: metric, mix: 1, version: 0 };
}

export function smooth(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * Point the blend at a new metric. From rest it starts a glide; in the middle of a glide it
 * reverses from where it is. Reduced motion lands on the end at once.
 */
export function retarget(current: Blend, metric: AtlasMetric, reduced: boolean): Blend {
  if (current.to === metric) return current;
  const version = current.version + 1;
  if (reduced) return { from: current.to, to: metric, mix: 1, version };
  if (current.from === current.to) return { from: current.to, to: metric, mix: 0, version };
  // Mid-glide and asked to go back: swap ends and keep the dots where they are.
  return { from: current.to, to: current.from, mix: 1 - current.mix, version };
}

export function advance(current: Blend, seconds: number): Blend {
  if (current.mix >= 1) return current;
  return { ...current, mix: Math.min(1, current.mix + seconds / BLEND_SECONDS) };
}
