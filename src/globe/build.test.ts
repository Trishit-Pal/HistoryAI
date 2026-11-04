import { describe, expect, it } from "vitest";
import { buildGlobe } from "./build";

const meta = { generatedAt: "2026-11-04", atlasNames: new Set<string>() };

function row(over: Record<string, string>): Record<string, string> {
  return {
    Model: "M",
    "Publication date": "2024-01-01",
    "Training compute (FLOP)": "1e24",
    Organization: "Lab",
    "Country (of organization)": "France",
    Link: "https://example.com/m",
    ...over,
  };
}

describe("buildGlobe", () => {
  it("keeps only models at or above 1e23 FLOP dated on or before 2026-11-01", () => {
    const g = buildGlobe(
      [
        row({ Model: "low", "Training compute (FLOP)": "9e22" }),
        row({ Model: "edge", "Training compute (FLOP)": "1e23" }),
        row({ Model: "late", "Publication date": "2026-11-02" }),
        row({ Model: "last", "Publication date": "2026-11-01" }),
      ],
      meta,
    );
    expect(g.countries[0].models.map((m) => m.name).sort()).toEqual(["edge", "last"]);
  });

  it("excludes rows with no date or no compute without producing NaN", () => {
    const g = buildGlobe(
      [row({ "Publication date": "" }), row({ "Training compute (FLOP)": "" }), row({ "Training compute (FLOP)": "abc" })],
      meta,
    );
    expect(g.countries).toEqual([]);
    expect(g.records).toEqual([]);
  });

  it("counts a multi-country model once per country and each lab once", () => {
    const g = buildGlobe(
      [row({ "Country (of organization)": "United States of America,United Kingdom", Organization: "Google DeepMind,Google, Google" })],
      meta,
    );
    expect(g.countries.map((c) => c.country)).toEqual(["United Kingdom", "United States of America"]);
    for (const c of g.countries) {
      expect(c.models).toHaveLength(1);
      expect(c.labs).toEqual(["Google", "Google DeepMind"]);
    }
  });

  it("puts Multinational rows in multinational, not on the globe", () => {
    const g = buildGlobe([row({ "Country (of organization)": "Multinational" })], meta);
    expect(g.countries).toEqual([]);
    expect(g.multinational).toHaveLength(1);
  });

  it("throws naming the country when a country has no centroid", () => {
    expect(() => buildGlobe([row({ "Country (of organization)": "Atlantis" })], meta)).toThrow(/no centroid for "Atlantis"/);
  });

  it("gives Hong Kong its own centroid", () => {
    const g = buildGlobe([row({ "Country (of organization)": "Hong Kong" })], meta);
    expect(g.countries[0]).toMatchObject({ country: "Hong Kong", lat: 22.3, lon: 114.2 });
  });

  it("records are the running maximum of compute across all rows from 2012 onward, with multipliers", () => {
    const g = buildGlobe(
      [
        row({ Model: "old", "Publication date": "2011-12-31", "Training compute (FLOP)": "1e30" }),
        row({ Model: "a", "Publication date": "2013-01-01", "Training compute (FLOP)": "1e18" }),
        row({ Model: "b", "Publication date": "2014-01-01", "Training compute (FLOP)": "1e20" }),
        row({ Model: "tie", "Publication date": "2015-01-01", "Training compute (FLOP)": "1e20" }),
        row({ Model: "smaller", "Publication date": "2016-01-01", "Training compute (FLOP)": "1e19" }),
        row({ Model: "c", "Publication date": "2017-01-01", "Training compute (FLOP)": "1e25" }),
        row({ Model: "future", "Publication date": "2026-12-01", "Training compute (FLOP)": "1e29" }),
      ],
      meta,
    );
    expect(g.records.map((r) => r.name)).toEqual(["a", "b", "c"]);
    expect(g.records[0].multiplier).toBeNull();
    for (let i = 1; i < g.records.length; i++) {
      expect(g.records[i].multiplier).toBeCloseTo(10 ** (g.records[i].logCompute - g.records[i - 1].logCompute));
    }
  });

  it("sets atlasName only when the name is in atlasNames", () => {
    const g = buildGlobe([row({ Model: "in" }), row({ Model: "out" })], { ...meta, atlasNames: new Set(["in"]) });
    const byName = Object.fromEntries(g.countries[0].models.map((m) => [m.name, m]));
    expect(byName.in.atlasName).toBe("in");
    expect(byName.out).not.toHaveProperty("atlasName");
  });
});
