import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { seedMuseum } from "../seed/eras";
import { EXCLUDES, EXTRA_PINS, LANDMARKS, PINS, landmarkForExhibit } from "./mapping";
import type { AtlasSnapshot } from "./types";

const atlas = JSON.parse(readFileSync(path.resolve("data/atlas-snapshot.json"), "utf8")) as AtlasSnapshot;
const exhibitIds = new Set(seedMuseum().snapshot().exhibits.map((exhibit) => exhibit.id));

describe("atlas landmarks", () => {
  it("names only models that are plotted in the current Epoch snapshot, spelled exactly", () => {
    const plotted = new Set(atlas.models.names);
    const missing = LANDMARKS.filter((landmark) => !plotted.has(landmark.model)).map((landmark) => landmark.model);
    expect(missing).toEqual([]);
  });

  it("points only at exhibits that exist in the museum", () => {
    const dangling = LANDMARKS.flatMap((landmark) => (landmark.exhibitId ? [landmark.exhibitId] : [])).filter(
      (id) => !exhibitIds.has(id),
    );
    expect(dangling).toEqual([]);
  });

  it("uses each model and each exhibit at most once", () => {
    const models = LANDMARKS.map((landmark) => landmark.model);
    const linked = LANDMARKS.flatMap((landmark) => (landmark.exhibitId ? [landmark.exhibitId] : []));
    expect(new Set(models).size).toBe(models.length);
    expect(new Set(linked).size).toBe(linked.length);
  });

  it("matches the Epoch model name to only one row, so a label cannot sit on the wrong point", () => {
    const counts = new Map<string, number>();
    for (const name of atlas.models.names) counts.set(name, (counts.get(name) ?? 0) + 1);
    const ambiguous = LANDMARKS.filter((landmark) => (counts.get(landmark.model) ?? 0) > 1).map((l) => l.model);
    expect(ambiguous).toEqual([]);
  });

  it("names only pins that exist in the snapshot, so a refresh that renames a model is noticed", () => {
    const plotted = new Set(atlas.models.names);
    expect(PINS.filter((name) => !plotted.has(name))).toEqual([]);
    expect(EXTRA_PINS.length).toBeGreaterThan(0);
  });

  it("names only exclusions that still exist, and never excludes a pin", () => {
    const plotted = new Set(atlas.models.names);
    expect(EXCLUDES.filter((name) => !plotted.has(name))).toEqual([]);
    expect(EXCLUDES.filter((name) => PINS.includes(name))).toEqual([]);
  });

  it("finds a landmark by its exhibit id", () => {
    expect(landmarkForExhibit("evt_2012_alexnet")?.model).toBe("AlexNet");
    expect(landmarkForExhibit("evt_1966_eliza")).toBeUndefined();
  });
});
