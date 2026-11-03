import { describe, expect, it } from "vitest";
import type { Hall } from "../domain/layout";
import { precursorsLayout } from "./precursorsRoom";
import { focusedPedestal, hallLength, hallOrigin, hallSpan, pedestalPosition, planCamera } from "./hallMath";

function hall(id: string, exhibitIds: string[], overrides: Partial<Hall> = {}): Hall {
  return {
    id,
    label: id,
    startYear: 1950,
    endYear: 1960,
    mood: "open",
    width: 1,
    light: 1,
    spacing: 2,
    exhibitIds,
    ...overrides,
  };
}

const halls = [hall("a", ["a1", "a2"]), hall("b", ["b1", "b2", "b3"], { spacing: 1.5 }), hall("c", ["c1"])];

describe("hall geometry", () => {
  it("is 8 units plus the exhibit spacing for each exhibit", () => {
    expect(hallLength(halls[0]!)).toBe(8 + 2 * 2);
    expect(hallLength(halls[1]!)).toBe(8 + 3 * 1.5);
  });

  it("starts the first hall at the origin and stacks later halls behind it", () => {
    expect(hallOrigin(0, halls)).toBe(0);
    expect(hallOrigin(1, halls)).toBe(-12);
    expect(hallOrigin(2, halls)).toBe(-12 - 12.5);
  });

  it("alternates pedestals left and right and walks them down the hall", () => {
    expect(pedestalPosition(1, 0, halls)).toEqual([-1.2, 0, -12 - 2]);
    expect(pedestalPosition(1, 1, halls)).toEqual([1.2, 0, -12 - 2 - 1.5]);
    expect(pedestalPosition(1, 2, halls)).toEqual([-1.2, 0, -12 - 2 - 3]);
  });
});

describe("focusedPedestal", () => {
  it("looks at the front of the current hall when nothing is focused", () => {
    expect(focusedPedestal(halls, 1, null)).toEqual([0, 0, -12 - 2]);
  });

  it("falls back to the generic pedestal for a hall without a placed layout", () => {
    expect(focusedPedestal(halls, 0, "b2")).toEqual(pedestalPosition(1, 1, halls));
  });

  it("uses the Precursors layout offset by the hall origin", () => {
    const precursors = [hall("a", ["a1"]), hall("era_0_precursors", ["p1", "p2"])];
    const spot = precursorsLayout(["p1", "p2"]).find((item) => item.id === "p2")!;
    expect(focusedPedestal(precursors, 1, "p2")).toEqual([spot.x, spot.y, hallOrigin(1, precursors) + spot.z]);
  });

  it("falls back to the front of the current hall for an id no hall holds", () => {
    expect(focusedPedestal(halls, 2, "missing")).toEqual([0, 0, hallOrigin(2, halls) - 2]);
  });
});

describe("hallSpan", () => {
  it("is empty for a hall with no start year", () => {
    expect(hallSpan(hall("p", [], { startYear: null, endYear: null }))).toBe("");
  });

  it("is open-ended when the hall has no end year", () => {
    expect(hallSpan(hall("p", [], { startYear: 2020, endYear: null }))).toBe(" 2020–");
  });

  it("joins the start and end years with an en dash", () => {
    expect(hallSpan(hall("p", [], { startYear: 1956, endYear: 1974 }))).toBe(" 1956–1974");
  });
});

describe("planCamera", () => {
  it("looks at the middle of the exhibits in the current hall from above and behind", () => {
    const { position, target } = planCamera(halls, 1);
    const spots = halls[1]!.exhibitIds.map((_, i) => pedestalPosition(1, i, halls));
    const zs = spots.map((spot) => spot[2]);
    expect(target[0]).toBeCloseTo(0);
    expect(target[1]).toBe(0);
    expect(target[2]).toBeCloseTo((Math.min(...zs) + Math.max(...zs)) / 2);
    expect(position[1]).toBeGreaterThan(8);
    expect(position[2]).toBeGreaterThan(target[2]);
  });

  it("rises for a longer hall so the whole sheet stays in view", () => {
    const longer = [hall("long", Array.from({ length: 12 }, (_, i) => `x${i}`))];
    expect(planCamera(longer, 0).position[1]).toBeGreaterThan(planCamera(halls, 0).position[1]);
  });

  it("falls back to the front of the hall when it holds no exhibits", () => {
    const empty = [hall("e", [])];
    const { target } = planCamera(empty, 0);
    expect(target).toEqual([0, 0, hallOrigin(0, empty) - 2]);
  });
});
