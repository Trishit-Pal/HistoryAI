import { describe, expect, it } from "vitest";
import { statsAt } from "./stats";
import type { GlobeModel, GlobeRecord, GlobeSnapshot } from "./types";

const model = (name: string, year: number, organizations: string[]): GlobeModel => ({
  name,
  date: `${year}-06-01`,
  year,
  logCompute: 23,
  organizations,
});
const a = model("a", 2020, ["X"]);
const b = model("b", 2022, ["X", "Y"]);
const record = (m: GlobeModel, multiplier: number | null): GlobeRecord => ({ ...m, multiplier });

const snapshot: GlobeSnapshot = {
  generatedAt: "2026-11-04",
  cutoff: "2026-11-01",
  threshold: 23,
  countries: [
    { country: "France", lat: 0, lon: 0, labs: ["X"], models: [a] },
    { country: "Japan", lat: 0, lon: 0, labs: ["X", "Y"], models: [b] },
    { country: "Germany", lat: 0, lon: 0, labs: ["Y"], models: [b] },
  ],
  multinational: [],
  records: [record(a, null), record(b, 10)],
};

describe("statsAt", () => {
  it("is all zero before the first large-scale model", () => {
    expect(statsAt(snapshot, 2018)).toEqual({ labs: 0, countries: 0, models: 0 });
  });

  it("is cumulative, counts a shared model once, and reports the latest record so far", () => {
    expect(statsAt(snapshot, 2020)).toMatchObject({ labs: 1, countries: 1, models: 1, largest: { name: "a" } });
    expect(statsAt(snapshot, 2025)).toMatchObject({ labs: 2, countries: 3, models: 2, largest: { name: "b" } });
  });
});
