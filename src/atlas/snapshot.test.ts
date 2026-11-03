import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { eraForYear } from "../domain/eras";
import { firstHttpsUrl } from "./build";
import { EXCLUDES, PINS } from "./mapping";
import { ERA_FLOORS, FEATURED_COUNT } from "./select";
import type { AtlasSnapshot } from "./types";

// The committed snapshot is shipped to the browser and its links become <a href>. A hand edit or a
// bad merge would skip the checks buildAtlas makes, so check the file itself.
const atlas = JSON.parse(readFileSync(path.resolve("data/atlas-snapshot.json"), "utf8")) as AtlasSnapshot;
const { models } = atlas;

describe("committed atlas snapshot", () => {
  it("names its source and the day it was copied", () => {
    expect(atlas.sourceId).toBe("epoch-ai-models");
    expect(atlas.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("has every column the same length as its count", () => {
    for (const [name, column] of Object.entries(models)) {
      if (Array.isArray(column)) expect(column.length, name).toBe(models.count);
    }
  });

  it("agrees with its own totals", () => {
    expect(atlas.totals.plotted).toBe(models.count);
    expect(atlas.totals.withCompute).toBe(models.logCompute.filter((value) => value !== null).length);
    expect(atlas.totals.withParameters).toBe(models.logParameters.filter((value) => value !== null).length);
    expect(atlas.totals.rows).toBeGreaterThanOrEqual(atlas.totals.plotted);
  });

  it("gives every model at least one metric", () => {
    for (let i = 0; i < models.count; i += 1) {
      expect(models.logCompute[i] !== null || models.logParameters[i] !== null, models.names[i]).toBe(true);
    }
  });

  it("keeps every domain index inside the lane list", () => {
    for (const index of models.domainIndex) {
      expect(Number.isInteger(index)).toBe(true);
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(atlas.domains.length);
    }
  });

  it("links every model only to a clean https address with no credentials", () => {
    const unsafe = models.links.filter((link) => firstHttpsUrl(link) !== link);
    expect(unsafe).toEqual([]);
  });

  it("lists models oldest first, with each fractional year inside its date's year", () => {
    for (let i = 0; i < models.count; i += 1) {
      expect(Math.floor(models.years[i]), models.names[i]).toBe(Number(models.dates[i].slice(0, 4)));
      if (i > 0) expect(models.years[i]).toBeGreaterThanOrEqual(models.years[i - 1]);
    }
  });

  it("names every model", () => {
    expect(models.names.every((name) => name.trim().length > 0)).toBe(true);
  });
});

describe("committed atlas snapshot: the featured models", () => {
  const featuredIndexes = models.names.flatMap((_, i) => (models.featured[i] ? [i] : []));

  it("features exactly the target number, and counts them in the totals", () => {
    expect(featuredIndexes).toHaveLength(FEATURED_COUNT);
    expect(atlas.totals.featured).toBe(FEATURED_COUNT);
  });

  it("keeps every plotted model in the file, so the show-all switch has something to show", () => {
    expect(models.count).toBe(atlas.totals.plotted);
    expect(models.count).toBeGreaterThan(FEATURED_COUNT);
  });

  it("features every pin and no exclusion", () => {
    const shown = new Set(featuredIndexes.map((i) => models.names[i]));
    expect(PINS.filter((name) => !shown.has(name))).toEqual([]);
    expect(EXCLUDES.filter((name) => shown.has(name))).toEqual([]);
  });

  it("gives every featured model at least one reason and the rest none", () => {
    for (let i = 0; i < models.count; i += 1) {
      if (models.featured[i]) expect(models.why[i].length, models.names[i]).toBeGreaterThan(0);
      else expect(models.why[i], models.names[i]).toEqual([]);
    }
  });

  it("gives every era its minimum, or every model it has that could be shown", () => {
    const eras = Object.entries(ERA_FLOORS);
    for (const [era, floor] of eras) {
      const inEra = (i: number) => eraForYear(Math.floor(models.years[i])).id === era;
      const shown = featuredIndexes.filter(inEra).length;
      const available = models.names.filter((name, i) => inEra(i) && models.logCompute[i] !== null && !EXCLUDES.includes(name)).length;
      expect(shown, era).toBeGreaterThanOrEqual(Math.min(floor as number, available));
    }
  });

  it("features only models with a compute estimate, except pins", () => {
    for (const i of featuredIndexes) {
      if (!PINS.includes(models.names[i])) expect(models.logCompute[i], models.names[i]).not.toBeNull();
    }
  });
});
