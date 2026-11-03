import { describe, expect, it } from "vitest";
import { YEAR_TICKS, gridBounds, gridSegments, valueTicks } from "./grid";
import { WORLD } from "./projection";

describe("YEAR_TICKS", () => {
  it("marks every decade inside the year axis", () => {
    expect(YEAR_TICKS[0]).toBe(1950);
    expect(YEAR_TICKS[YEAR_TICKS.length - 1]).toBe(2020);
    expect(YEAR_TICKS.every((year) => year % 10 === 0)).toBe(true);
  });
});

describe("valueTicks", () => {
  it("steps through each metric's own range, starting at the floor", () => {
    expect(valueTicks("compute")).toEqual([0, 4, 8, 12, 16, 20, 24, 28]);
    expect(valueTicks("parameters")).toEqual([0, 3, 6, 9, 12, 15]);
  });
});

describe("gridSegments", () => {
  it("draws a floor line per decade, a line per domain lane and a wall line per value tick", () => {
    const lanes = 5;
    const segments = gridSegments("compute", lanes);
    const expected = YEAR_TICKS.length + lanes + valueTicks("compute").length;
    expect(segments.length).toBe(expected * 6);
  });

  it("stays inside the plot", () => {
    const { xMin, xMax } = gridBounds(4);
    const segments = gridSegments("parameters", 4);
    for (let i = 0; i < segments.length; i += 3) {
      expect(segments[i]).toBeGreaterThanOrEqual(xMin - 1e-6);
      expect(segments[i]).toBeLessThanOrEqual(xMax + 1e-6);
      expect(segments[i + 1]).toBeGreaterThanOrEqual(0);
      expect(segments[i + 1]).toBeLessThanOrEqual(WORLD.height + 1e-6);
    }
  });

  it("puts the back wall behind the first lane and the front edge past the last", () => {
    const { zBack, zFront } = gridBounds(3);
    expect(zBack).toBeLessThan(-WORLD.laneGap);
    expect(zFront).toBeGreaterThan(WORLD.laneGap);
  });
});
