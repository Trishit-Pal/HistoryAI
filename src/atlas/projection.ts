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

export const DEFAULT_POSE: Pose = { position: [3, 14, 35], lookAt: [0, 6, 0] };
// About 1.2 times the farthest resting distance (REST_MAX): arriving is a short glide, not a long fall.
export const ENTRANCE_POSE: Pose = { position: [4, 17, 42], lookAt: [0, 6, 0] };

/** The camera's vertical field of view, in degrees. */
export const FIELD_OF_VIEW = 50;

// How much room to leave around what is fitted, so tick labels and domain names are not cut off.
const FIT_MARGIN = 1.1;
// Extra room, in world units, each side of the fitted bounds for tick labels, domain names and the axis title.
const LABEL_PAD = { x: 3, y: 3 } as const;
/** The farthest the resting camera sits from what it looks at. A very narrow canvas crops rather than shrinks the plot. */
export const REST_MAX = 38;
// Where the resting camera sits relative to the middle of the plot: a little right, well above, in front.
const REST_OFFSET: Vec3 = [2, 10, 25];

/** An axis-aligned box in world units. */
export interface Bounds {
  readonly min: Vec3;
  readonly max: Vec3;
}

/** The whole plot, for when no model is visible to fit to. */
export const WORLD_BOUNDS: Bounds = {
  min: [-WORLD.width / 2, 0, -WORLD.laneGap * 3],
  max: [WORLD.width / 2, WORLD.height, WORLD.laneGap * 3],
};

/**
 * Directions to look from, as the camera's offset from the middle of the plot. Top keeps a small
 * z so "up" on screen is still the back of the plot.
 */
export const VIEW_PRESETS = {
  front: [0, 0.3, 1],
  top: [0, 1, 0.12],
  side: [1, 0.2, 0],
} as const satisfies Record<string, Vec3>;

export type ViewPresetName = keyof typeof VIEW_PRESETS;

/** A request to move the camera to a named view. `seq` makes asking for the same view twice a new request. */
export interface ViewRequest {
  readonly name: ViewPresetName | "rest";
  readonly seq: number;
}

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

/** The box around some points, or the whole plot when there are none. */
export function boundsOf(points: readonly Vec3[]): Bounds {
  if (points.length === 0) return WORLD_BOUNDS;
  const min: [number, number, number] = [Infinity, Infinity, Infinity];
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];
  for (const point of points) {
    for (let axis = 0; axis < 3; axis += 1) {
      min[axis] = Math.min(min[axis], point[axis]);
      max[axis] = Math.max(max[axis], point[axis]);
    }
  }
  return { min, max };
}

/** Keeps a point inside the box: the panning limit, so the visitor cannot lose the plot. */
export function clampTarget(target: Vec3, bounds: Bounds): Vec3 {
  return [
    clamp(target[0], bounds.min[0], bounds.max[0]),
    clamp(target[1], bounds.min[1], bounds.max[1]),
    clamp(target[2], bounds.min[2], bounds.max[2]),
  ];
}

function viewPose(direction: Vec3, aspect: number, bounds: Bounds): Pose {
  if (!Number.isFinite(aspect) || aspect <= 0) return DEFAULT_POSE;
  const halfHeight = Math.tan((FIELD_OF_VIEW * Math.PI) / 360);
  const width = bounds.max[0] - bounds.min[0] + 2 * LABEL_PAD.x;
  const height = bounds.max[1] - bounds.min[1] + 2 * LABEL_PAD.y;
  const byWidth = (width * FIT_MARGIN) / 2 / (halfHeight * aspect);
  const byHeight = (height * FIT_MARGIN) / 2 / halfHeight;
  const distance = Math.min(Math.max(byWidth, byHeight), REST_MAX);
  const length = Math.hypot(...direction);
  const centre: Vec3 = [
    (bounds.min[0] + bounds.max[0]) / 2,
    (bounds.min[1] + bounds.max[1]) / 2,
    (bounds.min[2] + bounds.max[2]) / 2,
  ];
  return {
    position: [
      centre[0] + (direction[0] / length) * distance,
      centre[1] + (direction[1] / length) * distance,
      centre[2] + (direction[2] / length) * distance,
    ],
    lookAt: centre,
  };
}

/**
 * The resting camera for a canvas of this width-to-height ratio: as close as it can be while the
 * given bounds (the visible models), labels included, stay in view, and never farther than REST_MAX.
 */
export function restPose(aspect: number, bounds: Bounds = WORLD_BOUNDS): Pose {
  return viewPose(REST_OFFSET, aspect, bounds);
}

/** The camera for one of the named views, fitted the same way as the resting view. */
export function presetPose(name: ViewPresetName, aspect: number, bounds: Bounds = WORLD_BOUNDS): Pose {
  return viewPose(VIEW_PRESETS[name], aspect, bounds);
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
