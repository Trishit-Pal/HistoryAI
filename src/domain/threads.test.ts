import { describe, expect, it } from "vitest";
import { hallNeighbors, hallThreads, inYearIds, otherThreadId } from "./threads";

const nodes = [
  { id: "a", startYear: 1950 },
  { id: "b", startYear: 1954 },
  { id: "c", startYear: 1960 },
];

describe("hallThreads", () => {
  it("pairs consecutive in-year exhibits in hall order", () => {
    expect(hallThreads(["a", "b", "c"], nodes, 1960)).toEqual([
      { fromId: "a", toId: "b" },
      { fromId: "b", toId: "c" },
    ]);
  });

  it("skips ghosts and still connects the remaining pair", () => {
    expect(hallThreads(["a", "b", "c"], nodes, 1954)).toEqual([{ fromId: "a", toId: "b" }]);
    expect(inYearIds(["a", "b", "c"], nodes, 1954)).toEqual(["a", "b"]);
  });

  it("connects two in-year exhibits when a ghost sits between them", () => {
    expect(hallThreads(["a", "b", "c"], nodes, 1950)).toEqual([]);
    const laterGhost = [
      { id: "a", startYear: 1950 },
      { id: "ghost", startYear: 1999 },
      { id: "c", startYear: 1960 },
    ];
    expect(hallThreads(["a", "ghost", "c"], laterGhost, 1960)).toEqual([{ fromId: "a", toId: "c" }]);
  });

  it("yields nothing for a single in-year exhibit", () => {
    expect(hallThreads(["a"], nodes, 1960)).toEqual([]);
    expect(hallThreads(["a", "b"], nodes, 1949)).toEqual([]);
  });

  it("never invents a pair across halls", () => {
    const hallA = hallThreads(["a", "b"], nodes, 1960);
    const hallB = hallThreads(["c"], nodes, 1960);
    expect(hallA).toEqual([{ fromId: "a", toId: "b" }]);
    expect(hallB).toEqual([]);
    expect([...hallA, ...hallB].some((thread) => thread.fromId === "b" && thread.toId === "c")).toBe(false);
  });
});

describe("hallNeighbors", () => {
  it("names earlier and later in the in-year chain", () => {
    expect(hallNeighbors(["a", "b", "c"], nodes, 1960, "b")).toEqual({ earlier: "a", later: "c" });
    expect(hallNeighbors(["a", "b", "c"], nodes, 1960, "a")).toEqual({ later: "b" });
    expect(hallNeighbors(["a", "b", "c"], nodes, 1960, "c")).toEqual({ earlier: "b" });
  });

  it("skips a ghost between neighbors", () => {
    const mixed = [
      { id: "a", startYear: 1950 },
      { id: "ghost", startYear: 1999 },
      { id: "c", startYear: 1960 },
    ];
    expect(hallNeighbors(["a", "ghost", "c"], mixed, 1960, "a")).toEqual({ later: "c" });
  });
});

describe("otherThreadId", () => {
  it("opens the end that is not focused", () => {
    const thread = { fromId: "a", toId: "b" };
    expect(otherThreadId(thread, "a")).toBe("b");
    expect(otherThreadId(thread, "b")).toBe("a");
    expect(otherThreadId(thread, "c")).toBe("b");
  });
});
