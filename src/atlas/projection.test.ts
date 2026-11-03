import { describe, expect, it } from "vitest";
import {
  DEFAULT_POSE,
  ENTRANCE_POSE,
  FIELD_OF_VIEW,
  METRIC_AXIS,
  WORLD,
  YEAR_AXIS,
  focusPose,
  instanceState,
  readingFor,
  restPose,
  xOfYear,
  yOfLog,
  zOfLane,
} from "./projection";

describe("xOfYear", () => {
  it("spreads the year axis symmetrically across the world width", () => {
    expect(xOfYear(YEAR_AXIS.min)).toBeCloseTo(-WORLD.width / 2, 6);
    expect(xOfYear(YEAR_AXIS.max)).toBeCloseTo(WORLD.width / 2, 6);
    expect(xOfYear((YEAR_AXIS.min + YEAR_AXIS.max) / 2)).toBeCloseTo(0, 6);
  });

  it("clamps years outside the axis instead of drawing off the plot", () => {
    expect(xOfYear(1800)).toBe(xOfYear(YEAR_AXIS.min));
    expect(xOfYear(3000)).toBe(xOfYear(YEAR_AXIS.max));
  });

  it("moves right as years increase", () => {
    expect(xOfYear(2012)).toBeLessThan(xOfYear(2013));
  });
});

describe("yOfLog", () => {
  it("maps each metric's range onto the world height", () => {
    for (const metric of ["compute", "parameters"] as const) {
      const axis = METRIC_AXIS[metric];
      expect(yOfLog(metric, axis.min)).toBeCloseTo(0, 6);
      expect(yOfLog(metric, axis.max)).toBeCloseTo(WORLD.height, 6);
    }
  });

  it("clamps values outside the axis", () => {
    expect(yOfLog("compute", -5)).toBe(0);
    expect(yOfLog("compute", 99)).toBe(WORLD.height);
  });

  it("is linear in the log, so each decade of compute is the same height", () => {
    const step = yOfLog("compute", 11) - yOfLog("compute", 10);
    expect(yOfLog("compute", 21) - yOfLog("compute", 20)).toBeCloseTo(step, 6);
  });
});

describe("zOfLane", () => {
  it("centres the lanes on zero", () => {
    expect(zOfLane(0, 3) + zOfLane(2, 3)).toBeCloseTo(0, 6);
    expect(zOfLane(1, 3)).toBeCloseTo(0, 6);
  });

  it("puts a single lane at zero and keeps lanes one gap apart", () => {
    expect(zOfLane(0, 1)).toBe(0);
    expect(zOfLane(1, 4) - zOfLane(0, 4)).toBeCloseTo(WORLD.laneGap, 6);
  });
});

describe("instanceState", () => {
  const base = { year: 2012.5, lane: 1, laneCount: 3, cutoff: 2100, featured: true, showAll: false };

  it("sits at the point for a metric it has, at full size", () => {
    const state = instanceState({
      ...base,
      from: { metric: "compute", log: 17 },
      to: { metric: "compute", log: 17 },
      mix: 1,
    });
    expect(state.position[0]).toBeCloseTo(xOfYear(2012.5), 6);
    expect(state.position[1]).toBeCloseTo(yOfLog("compute", 17), 6);
    expect(state.position[2]).toBeCloseTo(zOfLane(1, 3), 6);
    expect(state.scale).toBe(1);
    expect(state.dimmed).toBe(false);
  });

  it("glides between the two metrics while both exist", () => {
    const from = yOfLog("compute", 17);
    const to = yOfLog("parameters", 8);
    const state = instanceState({
      ...base,
      from: { metric: "compute", log: 17 },
      to: { metric: "parameters", log: 8 },
      mix: 0.5,
    });
    expect(state.position[1]).toBeCloseTo((from + to) / 2, 6);
    expect(state.scale).toBe(1);
  });

  it("grows in when only the new metric exists, and shrinks out when only the old one did", () => {
    const growing = instanceState({
      ...base,
      from: { metric: "compute", log: null },
      to: { metric: "parameters", log: 8 },
      mix: 0.25,
    });
    expect(growing.scale).toBeCloseTo(0.25, 6);
    expect(growing.position[1]).toBeCloseTo(yOfLog("parameters", 8), 6);

    const shrinking = instanceState({
      ...base,
      from: { metric: "compute", log: 17 },
      to: { metric: "parameters", log: null },
      mix: 0.25,
    });
    expect(shrinking.scale).toBeCloseTo(0.75, 6);
    expect(shrinking.position[1]).toBeCloseTo(yOfLog("compute", 17), 6);
  });

  it("is invisible when it has neither metric", () => {
    const state = instanceState({
      ...base,
      from: { metric: "compute", log: null },
      to: { metric: "parameters", log: null },
      mix: 0.5,
    });
    expect(state.scale).toBe(0);
  });

  it("hides a model that is not featured, unless every model is being shown", () => {
    const point = { from: { metric: "compute" as const, log: 17 }, to: { metric: "compute" as const, log: 17 }, mix: 1 };
    const hidden = instanceState({ ...base, ...point, featured: false, showAll: false });
    expect(hidden.scale).toBe(0);

    const shown = instanceState({ ...base, ...point, featured: false, showAll: true });
    expect(shown.scale).toBe(1);
    expect(shown.muted).toBe(true);
  });

  it("never mutes a featured model, whether or not every model is being shown", () => {
    const point = { from: { metric: "compute" as const, log: 17 }, to: { metric: "compute" as const, log: 17 }, mix: 1 };
    expect(instanceState({ ...base, ...point, featured: true, showAll: false }).muted).toBe(false);
    expect(instanceState({ ...base, ...point, featured: true, showAll: true }).muted).toBe(false);
  });

  it("keeps the glide between measures working for a model that is shown", () => {
    const state = instanceState({
      ...base,
      from: { metric: "compute", log: 17 },
      to: { metric: "parameters", log: 8 },
      mix: 0.5,
      featured: false,
      showAll: true,
    });
    expect(state.scale).toBe(1);
  });

  it("does not dim a model from part-way through the chosen year", () => {
    const state = instanceState({
      ...base,
      year: 2020.5,
      cutoff: 2020,
      from: { metric: "compute", log: 17 },
      to: { metric: "compute", log: 17 },
      mix: 1,
    });
    expect(state.dimmed).toBe(false);
  });

  it("marks models after the chosen year as dimmed rather than removing them", () => {
    const state = instanceState({
      ...base,
      cutoff: 2000,
      from: { metric: "compute", log: 17 },
      to: { metric: "compute", log: 17 },
      mix: 1,
    });
    expect(state.dimmed).toBe(true);
    expect(state.scale).toBe(1);
  });
});

describe("readingFor", () => {
  const models = { logCompute: [20, null], logParameters: [null, 9] };

  it("reads the active metric for one model and keeps a missing value as null", () => {
    expect(readingFor(models, 0, "compute")).toEqual({ metric: "compute", log: 20 });
    expect(readingFor(models, 0, "parameters")).toEqual({ metric: "parameters", log: null });
    expect(readingFor(models, 1, "parameters")).toEqual({ metric: "parameters", log: 9 });
  });
});

describe("restPose", () => {
  it("backs the camera off further for a narrower canvas so the whole plot still fits", () => {
    const distance = (aspect: number) => {
      const { position, lookAt } = restPose(aspect);
      return Math.hypot(position[0] - lookAt[0], position[1] - lookAt[1], position[2] - lookAt[2]);
    };
    expect(distance(0.8)).toBeGreaterThan(distance(1.6));
    expect(distance(1.6)).toBeGreaterThanOrEqual(distance(3));
  });

  it("always looks at the middle of the plot from in front of and above it", () => {
    const pose = restPose(1.5);
    expect(pose.lookAt).toEqual(DEFAULT_POSE.lookAt);
    expect(pose.position[2]).toBeGreaterThan(pose.lookAt[2]);
    expect(pose.position[1]).toBeGreaterThan(pose.lookAt[1]);
  });

  it("keeps the whole plot width inside the horizontal view", () => {
    for (const aspect of [0.7, 1.2, 1.6, 2.4]) {
      const { position, lookAt } = restPose(aspect);
      const distance = Math.hypot(position[0] - lookAt[0], position[1] - lookAt[1], position[2] - lookAt[2]);
      const halfWidthSeen = distance * Math.tan((FIELD_OF_VIEW * Math.PI) / 360) * aspect;
      expect(halfWidthSeen).toBeGreaterThanOrEqual(WORLD.width / 2);
    }
  });

  it("falls back to the default pose for a canvas with no usable size", () => {
    expect(restPose(0)).toEqual(DEFAULT_POSE);
    expect(restPose(Number.NaN)).toEqual(DEFAULT_POSE);
  });
});

describe("camera poses", () => {
  it("looks straight at the focused point from in front of and above it", () => {
    const pose = focusPose([3, 4, -1], 7);
    expect(pose.lookAt).toEqual([3, 4, -1]);
    expect(pose.position[2]).toBeGreaterThan(-1);
    expect(pose.position[1]).toBeGreaterThan(4);
  });

  it("stays in front of the front domain lane, so no dot passes between the camera and its target", () => {
    const frontLaneEdge = 7.4;
    const pose = focusPose([3, 4, -4.5], frontLaneEdge);
    expect(pose.position[2]).toBeGreaterThan(frontLaneEdge);
  });

  it("starts the entrance move farther back than the resting view", () => {
    expect(ENTRANCE_POSE.position[2]).toBeGreaterThan(DEFAULT_POSE.position[2]);
  });
});
