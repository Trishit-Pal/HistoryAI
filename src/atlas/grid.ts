import { METRIC_AXIS, WORLD, YEAR_AXIS, xOfYear, yOfLog, zOfLane } from "./projection";
import type { AtlasMetric } from "./types";

const DECADE = 10;
const EDGE_MARGIN = 1.4;

/** Every decade that falls inside the year axis. */
export const YEAR_TICKS: readonly number[] = Array.from(
  { length: Math.floor((YEAR_AXIS.max - YEAR_AXIS.min) / DECADE) + 1 },
  (_, i) => YEAR_AXIS.min + i * DECADE,
).filter((year) => year <= YEAR_AXIS.max);

/** The labelled log values on the vertical axis. */
export function valueTicks(metric: AtlasMetric): number[] {
  const { min, max, step } = METRIC_AXIS[metric];
  const ticks: number[] = [];
  for (let value = min; value <= max; value += step) ticks.push(value);
  return ticks;
}

export function gridBounds(laneCount: number) {
  return {
    xMin: -WORLD.width / 2,
    xMax: WORLD.width / 2,
    zBack: zOfLane(0, laneCount) - EDGE_MARGIN,
    zFront: zOfLane(laneCount - 1, laneCount) + EDGE_MARGIN,
  };
}

/**
 * Line segments (x1,y1,z1,x2,y2,z2 per line) for the plot's frame: decade lines and lane lines on
 * the floor, and a line at each value tick on the back wall.
 */
export function gridSegments(metric: AtlasMetric, laneCount: number): Float32Array {
  const { xMin, xMax, zBack, zFront } = gridBounds(laneCount);
  const lines: number[][] = [];

  for (const year of YEAR_TICKS) {
    const x = xOfYear(year);
    lines.push([x, 0, zBack, x, 0, zFront]);
  }
  for (let lane = 0; lane < laneCount; lane += 1) {
    const z = zOfLane(lane, laneCount);
    lines.push([xMin, 0, z, xMax, 0, z]);
  }
  for (const value of valueTicks(metric)) {
    const y = yOfLog(metric, value);
    lines.push([xMin, y, zBack, xMax, y, zBack]);
  }
  return new Float32Array(lines.flat());
}
