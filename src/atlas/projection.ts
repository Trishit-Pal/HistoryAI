import type { AtlasMetric } from "./types";

export type Vec3 = readonly [number, number, number];

export interface Pose {
  readonly position: Vec3;
  readonly lookAt: Vec3;
}

/** The years the x axis spans. Epoch's data starts in 1950. */
export const YEAR_AXIS = { min: 1950, max: 2027 } as const;

/** log10 ranges the y axis spans for each metric, and the gap between labelled ticks. */
export const METRIC_AXIS: Record<AtlasMetric, { min: number; max: number; step: number }> = {
  compute: { min: 0, max: 28, step: 4 },
  parameters: { min: 0, max: 15, step: 3 },
};

/** World units: the plot is `width` along years, `height` along the metric, `laneGap` between domains. */
export const WORLD = { width: 44, height: 12, laneGap: 1.5 } as const;

export const DEFAULT_POSE: Pose = { position: [5, 15, 30], lookAt: [3, 5, 0] };
export const ENTRANCE_POSE: Pose = { position: [3, 24, 64], lookAt: [3, 5, 0] };

/** The camera's vertical field of view, in degrees. */
export const FIELD_OF_VIEW = 50;

// How much room to leave around the plot for tick labels and the domain names on its right edge.
const FIT_MARGIN = 1.4;
// The plot is WORLD.height tall; the axis title and winter names stand above it.
const VIEW_HEIGHT = WORLD.height + 6;
// Where the resting camera sits relative to the middle of the plot: a little right, well above, in front.
const REST_OFFSET: Vec3 = [2, 10, 25];

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function lerp(from: number, to: number, amount: number): number {
  return from + (to - from) * amount;
}

export function xOfYear(year: number): number {
  const t = (clamp(year, YEAR_AXIS.min, YEAR_AXIS.max) - YEAR_AXIS.min) / (YEAR_AXIS.max - YEAR_AXIS.min);
  return (t - 0.5) * WORLD.width;
}

export function yOfLog(metric: AtlasMetric, log: number): number {
  const axis = METRIC_AXIS[metric];
  const t = (clamp(log, axis.min, axis.max) - axis.min) / (axis.max - axis.min);
  return t * WORLD.height;
}

export function zOfLane(lane: number, laneCount: number): number {
  return (lane - (laneCount - 1) / 2) * WORLD.laneGap;
}

export interface MetricReading {
  metric: AtlasMetric;
  /** log10 of the value, or null when Epoch publishes none. */
  log: number | null;
}

/** One model's value for one metric, taken from the snapshot's columns. */
export function readingFor(
  models: { logCompute: Array<number | null>; logParameters: Array<number | null> },
  index: number,
  metric: AtlasMetric,
): MetricReading {
  const column = metric === "compute" ? models.logCompute : models.logParameters;
  return { metric, log: column[index] ?? null };
}

export interface InstanceInput {
  year: number;
  lane: number;
  laneCount: number;
  from: MetricReading;
  to: MetricReading;
  /** 0 shows the `from` metric, 1 shows the `to` metric. */
  mix: number;
  /** Models published after this year are dimmed. */
  cutoff: number;
  /** Whether this is one of the models shown by default. */
  featured: boolean;
  /** Whether every model is being shown, not only the featured ones. */
  showAll: boolean;
}

export interface InstanceState {
  position: Vec3;
  /** 0 hides the point, 1 is full size. */
  scale: number;
  dimmed: boolean;
  /** Shown only because every model is being shown: drawn small and faint. */
  muted: boolean;
}

/**
 * Where one model sits, and how big, while the scene switches metric. A model that exists in both
 * metrics glides; one that exists in only one grows in or shrinks out. Nothing is invented for a
 * metric Epoch has no value for.
 */
export function instanceState(input: InstanceInput): InstanceState {
  const { from, to, mix } = input;
  const x = xOfYear(input.year);
  const z = zOfLane(input.lane, input.laneCount);
  // Whole years: with the slider on 2020 a model from mid-2020 is still shown, as the label says.
  const dimmed = Math.floor(input.year) > input.cutoff;
  const muted = !input.featured;
  const hidden = muted && !input.showAll;

  if (hidden) return { position: [x, 0, z], scale: 0, dimmed, muted };
  if (from.log !== null && to.log !== null) {
    const y = lerp(yOfLog(from.metric, from.log), yOfLog(to.metric, to.log), mix);
    return { position: [x, y, z], scale: 1, dimmed, muted };
  }
  if (to.log !== null) return { position: [x, yOfLog(to.metric, to.log), z], scale: mix, dimmed, muted };
  if (from.log !== null) return { position: [x, yOfLog(from.metric, from.log), z], scale: 1 - mix, dimmed, muted };
  return { position: [x, 0, z], scale: 0, dimmed, muted };
}

/**
 * The resting camera for a canvas of this width-to-height ratio: as close as it can be while the
 * whole plot, labels included, stays in view. A narrow canvas needs the camera further back.
 */
export function restPose(aspect: number): Pose {
  if (!Number.isFinite(aspect) || aspect <= 0) return DEFAULT_POSE;
  const halfHeight = Math.tan((FIELD_OF_VIEW * Math.PI) / 360);
  const byWidth = (WORLD.width * FIT_MARGIN) / 2 / (halfHeight * aspect);
  const byHeight = (VIEW_HEIGHT * FIT_MARGIN) / 2 / halfHeight;
  const distance = Math.max(byWidth, byHeight);
  const length = Math.hypot(...REST_OFFSET);
  const [lx, ly, lz] = DEFAULT_POSE.lookAt;
  return {
    position: [
      lx + (REST_OFFSET[0] / length) * distance,
      ly + (REST_OFFSET[1] / length) * distance,
      lz + (REST_OFFSET[2] / length) * distance,
    ],
    lookAt: DEFAULT_POSE.lookAt,
  };
}

// How far in front of the target the focus camera sits, and how far clear of the front lane it stays.
const FOCUS_OFFSET: Vec3 = [4, 5, 12];
const FRONT_CLEARANCE = 3;

/**
 * The camera pose for looking at a point: in front of it and above it, and always clear of the
 * front domain lane so no other dot passes between the camera and what it is looking at.
 */
export function focusPose(target: Vec3, frontZ: number): Pose {
  return {
    position: [
      target[0] + FOCUS_OFFSET[0],
      target[1] + FOCUS_OFFSET[1],
      Math.max(target[2] + FOCUS_OFFSET[2], frontZ + FRONT_CLEARANCE),
    ],
    lookAt: target,
  };
}
