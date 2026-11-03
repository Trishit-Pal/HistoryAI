import { describe, expect, it } from "vitest";
import { sealRooms, type Floor, type Hall } from "../domain/layout";
import { enterHall, focusExhibit, isSealed, reconcileFocus, type NavState } from "./seal";
import type { MuseumNode } from "./view";

function node(id: string, startYear: number): MuseumNode {
  return { id, startYear } as MuseumNode;
}

function hall(id: string, exhibitIds: string[]): Hall {
  return {
    id,
    label: id,
    startYear: 1950,
    endYear: null,
    mood: "open",
    width: 1,
    light: 1,
    spacing: 2,
    exhibitIds,
  };
}

const nodes = [node("a1", 1950), node("a2", 1960), node("b1", 1980), node("b2", 1990), node("p1", 2024)];
const halls = [hall("a", ["a1", "a2"]), hall("b", ["b1", "b2"]), hall("provisional", ["p1"])];
const ctx = (year: number) => ({ halls, nodes, year });

describe("isSealed", () => {
  it("seals a hall whose exhibits all start after the year", () => {
    expect(isSealed(halls[1]!, nodes, 1970)).toBe(true);
  });

  it("opens a hall as soon as one exhibit has started", () => {
    expect(isSealed(halls[1]!, nodes, 1980)).toBe(false);
  });

  it("never seals a hall with no known exhibits", () => {
    expect(isSealed(hall("empty", []), nodes, 1800)).toBe(false);
    expect(isSealed(hall("ghost", ["nope"]), nodes, 1800)).toBe(false);
  });

  it("keeps the provisional hall sealed before 2023", () => {
    expect(isSealed(halls[2]!, nodes, 2022)).toBe(true);
    expect(isSealed(halls[2]!, nodes, 2023)).toBe(false);
  });
});

describe("enterHall", () => {
  const start: NavState = { focusedId: "a1", hallIndex: 0 };

  it("moves to the hall and focuses its first exhibit already in view", () => {
    expect(enterHall(start, 1, ctx(1985))).toEqual({ focusedId: "b1", hallIndex: 1 });
  });

  it("stays put when the hall is sealed", () => {
    expect(enterHall(start, 1, ctx(1970))).toBe(start);
  });

  it("clamps an index past either end", () => {
    expect(enterHall({ focusedId: "b1", hallIndex: 1 }, 99, ctx(2026)).hallIndex).toBe(2);
    expect(enterHall({ focusedId: "b1", hallIndex: 1 }, -3, ctx(2026)).hallIndex).toBe(0);
  });
});

describe("focusExhibit", () => {
  it("focuses the exhibit and follows it into its hall", () => {
    expect(focusExhibit({ focusedId: "a1", hallIndex: 0 }, "b2", ctx(2000))).toEqual({
      focusedId: "b2",
      hallIndex: 1,
    });
  });

  it("focuses an exhibit in a sealed hall without entering the hall", () => {
    expect(focusExhibit({ focusedId: "a1", hallIndex: 0 }, "b2", ctx(1970))).toEqual({
      focusedId: "b2",
      hallIndex: 0,
    });
  });
});

describe("reconcileFocus", () => {
  it("keeps the state when the focused exhibit is still in view", () => {
    const state: NavState = { focusedId: "a2", hallIndex: 0 };
    expect(reconcileFocus(state, ctx(1965))).toBe(state);
  });

  it("jumps to the nearest exhibit in view when the focused one is in the future", () => {
    expect(reconcileFocus({ focusedId: "b2", hallIndex: 1 }, ctx(1962))).toEqual({
      focusedId: "a2",
      hallIndex: 0,
    });
  });

  it("does nothing when no exhibit has started yet", () => {
    const state: NavState = { focusedId: "a1", hallIndex: 0 };
    expect(reconcileFocus(state, ctx(1900))).toBe(state);
  });

  it("walks back to the nearest open hall when the current hall seals", () => {
    const sealedHall = halls.slice(0, 2);
    const result = reconcileFocus(
      { focusedId: null, hallIndex: 1 },
      { halls: sealedHall, nodes, year: 1970 },
    );
    expect(result).toEqual({ focusedId: "a1", hallIndex: 0 });
  });

  it("leaves the state alone when the current hall is open", () => {
    const state: NavState = { focusedId: null, hallIndex: 1 };
    expect(reconcileFocus(state, ctx(1985))).toBe(state);
  });
});

describe("the two seal rules", () => {
  it("agree for every hall at every year cursor", () => {
    const withEmpty = [...halls, hall("bare", [])];
    const floor: Floor = {
      rooms: withEmpty.map((item) => ({ id: item.id, startYear: null, endYear: null, exhibitIds: item.exhibitIds })),
      startYears: Object.fromEntries(nodes.map((item) => [item.id, item.startYear])),
    };
    for (let year = 1900; year <= 2030; year += 5) {
      const sealed = new Set(sealRooms(floor, year));
      for (const item of withEmpty) expect(isSealed(item, nodes, year), `${item.id} @ ${year}`).toBe(sealed.has(item.id));
    }
  });
});
