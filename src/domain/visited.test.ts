import { describe, expect, it } from "vitest";
import { hallTally, parseVisited, tallyLabel } from "./visited";

const nodes = [
  { id: "a", startYear: 1950 },
  { id: "b", startYear: 1954 },
  { id: "c", startYear: 1960 },
];

describe("hallTally", () => {
  it("is empty when none of the in-year exhibits have been opened", () => {
    expect(hallTally(["a", "b", "c"], nodes, 1960, [])).toEqual({ opened: 0, total: 3 });
  });

  it("counts a partial set of opened in-year exhibits", () => {
    expect(hallTally(["a", "b", "c"], nodes, 1960, ["a"])).toEqual({ opened: 1, total: 3 });
  });

  it("counts a complete set of opened in-year exhibits", () => {
    expect(hallTally(["a", "b", "c"], nodes, 1960, ["c", "a", "b"])).toEqual({ opened: 3, total: 3 });
  });

  it("keeps a stored ghost out of both numbers", () => {
    expect(hallTally(["a", "b", "c"], nodes, 1954, ["a", "c"])).toEqual({ opened: 1, total: 2 });
  });

  it("ignores an id from another hall", () => {
    expect(hallTally(["a", "b"], nodes, 1960, ["a", "c"])).toEqual({ opened: 1, total: 2 });
  });
});

describe("parseVisited", () => {
  it("returns an empty list for bad JSON", () => {
    expect(parseVisited("not json")).toEqual([]);
    expect(parseVisited("{")).toEqual([]);
    expect(parseVisited(null)).toEqual([]);
  });

  it("keeps string ids from a JSON array", () => {
    expect(parseVisited('["a", 1, "b"]')).toEqual(["a", "b"]);
  });
});

describe("tallyLabel", () => {
  it("hides when the hall has no in-year exhibits", () => {
    expect(tallyLabel({ opened: 0, total: 0 })).toBeNull();
  });

  it("names the opened count", () => {
    expect(tallyLabel({ opened: 3, total: 7 })).toBe("3 of 7 opened");
  });
});
