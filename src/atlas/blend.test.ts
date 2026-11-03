import { describe, expect, it } from "vitest";
import { type Blend, advance, retarget, smooth, steady } from "./blend";

describe("steady", () => {
  it("starts finished on one metric", () => {
    expect(steady("compute")).toEqual({ from: "compute", to: "compute", mix: 1, version: 0 });
  });
});

describe("retarget", () => {
  it("begins a glide from the metric on screen to the new one", () => {
    const next = retarget(steady("compute"), "parameters", false);
    expect(next).toMatchObject({ from: "compute", to: "parameters", mix: 0 });
  });

  it("jumps straight to the end under reduced motion, and still counts as a change", () => {
    const start = steady("compute");
    const next = retarget(start, "parameters", true);
    expect(next).toMatchObject({ from: "compute", to: "parameters", mix: 1 });
    expect(next.version).toBeGreaterThan(start.version);
  });

  it("reverses a glide in progress from where it is, instead of jumping", () => {
    const midway: Blend = { from: "compute", to: "parameters", mix: 0.3, version: 1 };
    const back = retarget(midway, "compute", false);
    expect(back).toMatchObject({ from: "parameters", to: "compute" });
    expect(back.mix).toBeCloseTo(0.7, 6);
  });

  it("changes nothing when already heading to that metric", () => {
    const midway: Blend = { from: "compute", to: "parameters", mix: 0.3, version: 1 };
    expect(retarget(midway, "parameters", false)).toBe(midway);
  });
});

describe("advance", () => {
  it("moves the glide forward by elapsed time and stops at the end", () => {
    const start: Blend = { from: "compute", to: "parameters", mix: 0, version: 1 };
    const half = advance(start, 0.35);
    expect(half.mix).toBeGreaterThan(0);
    expect(half.mix).toBeLessThan(1);
    expect(advance(start, 10).mix).toBe(1);
  });

  it("leaves a finished blend alone", () => {
    const done = steady("compute");
    expect(advance(done, 1)).toBe(done);
  });
});

describe("smooth", () => {
  it("eases in and out between 0 and 1", () => {
    expect(smooth(0)).toBe(0);
    expect(smooth(1)).toBe(1);
    expect(smooth(0.5)).toBeCloseTo(0.5, 6);
    expect(smooth(0.1)).toBeLessThan(0.1);
  });
});
