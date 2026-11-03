import { describe, expect, it } from "vitest";
import { describeCoverage, describeModel, featuredDrawn, isDrawn } from "./describe";
import { hashForModel, modelFromHash } from "./hash";
import type { AtlasSnapshot } from "./types";

const atlas: AtlasSnapshot = {
  generatedAt: "2026-11-03",
  sourceId: "epoch-ai-models",
  totals: { rows: 2, plotted: 2, withCompute: 1, withParameters: 2, featured: 1 },
  domains: ["Vision", "Language"],
  models: {
    count: 2,
    names: ["AlexNet", "Mystery"],
    dates: ["2012-09-30", "2020-01-01"],
    years: [2012.75, 2020],
    logCompute: [17.672, null],
    logParameters: [7.778, 9],
    domainIndex: [0, 1],
    organizations: ["University of Toronto", ""],
    links: ["https://example.org/alexnet", "https://example.org/mystery"],
    epochConfidence: ["Confident", ""],
    featured: [true, false],
    why: [["Largest training run of its day"], []],
  },
};

describe("describeModel", () => {
  it("turns one column-row into labelled, human-readable facts", () => {
    const model = describeModel(atlas, 0);
    expect(model.name).toBe("AlexNet");
    expect(model.date).toBe("2012-09-30");
    expect(model.year).toBe(2012);
    expect(model.organization).toBe("University of Toronto");
    expect(model.domain).toBe("Vision");
    expect(model.compute).toBe("4.7 × 10^17 FLOP");
    expect(model.parameters).toBe("60 M");
    expect(model.epochConfidence).toBe("Confident");
    expect(model.link).toBe("https://example.org/alexnet");
  });

  it("carries the reasons a featured model was chosen, and none for the rest", () => {
    expect(describeModel(atlas, 0).why).toEqual(["Largest training run of its day"]);
    expect(describeModel(atlas, 1).why).toEqual([]);
  });

  it("spaces out organisations that Epoch joins with a bare comma", () => {
    const joined: AtlasSnapshot = {
      ...atlas,
      models: { ...atlas.models, organizations: ["Google Research,Google Brain", ""] },
    };
    expect(describeModel(joined, 0).organization).toBe("Google Research, Google Brain");
  });

  it("says plainly what Epoch does not publish instead of leaving a blank", () => {
    const model = describeModel(atlas, 1);
    expect(model.compute).toBe("No estimate published");
    expect(model.organization).toBe("Not stated");
    expect(model.epochConfidence).toBe("Not rated");
  });
});

describe("landmark hash", () => {
  it("round-trips a model name, including characters that need escaping", () => {
    for (const name of ["AlexNet", "GPT-3 175B (davinci)", "TD-Gammon"]) {
      expect(modelFromHash(hashForModel(name))).toBe(name);
    }
  });

  it("reads nothing from an empty, foreign or malformed hash", () => {
    expect(modelFromHash("")).toBeUndefined();
    expect(modelFromHash("#other=1")).toBeUndefined();
    expect(modelFromHash("#model=%E0%A4%A")).toBeUndefined();
  });

  it("clears the hash when no model is focused", () => {
    expect(hashForModel(null)).toBe("");
  });
});

describe("featuredDrawn", () => {
  it("counts the featured models that have a value for the measure", () => {
    expect(featuredDrawn(atlas.models, "compute")).toBe(1);
    expect(featuredDrawn(atlas.models, "parameters")).toBe(1);
    const noParameters = { ...atlas.models, logParameters: [null, 9] };
    expect(featuredDrawn(noParameters, "parameters")).toBe(0);
  });
});

describe("describeCoverage", () => {
  const totals = { rows: 3706, plotted: 2498, withCompute: 1406, withParameters: 2343, featured: 80 };

  it("says how many of the measured models are shown, and how to see the rest", () => {
    const text = describeCoverage({ metric: "compute", totals, showAll: false, drawn: 79 });
    expect(text).toContain("79 most significant");
    expect(text).toContain("1,406");
    expect(text).toContain("training compute estimate");
    expect(text).toContain("Show all models");
  });

  it("says everything is shown, and that the significant ones are larger, when every model is on", () => {
    const text = describeCoverage({ metric: "parameters", totals, showAll: true, drawn: 61 });
    expect(text).toContain("all 2,343");
    expect(text).toContain("parameter count");
    expect(text).toContain("61");
    expect(text).not.toContain("Show all models");
  });
});

describe("isDrawn", () => {
  const featured = [true, false];

  it("always draws a featured model", () => {
    expect(isDrawn(featured, 0, false)).toBe(true);
    expect(isDrawn(featured, 0, true)).toBe(true);
  });

  it("draws a model that is not featured only while every model is shown", () => {
    expect(isDrawn(featured, 1, true)).toBe(true);
    expect(isDrawn(featured, 1, false)).toBe(false);
  });

  it("treats nothing selected, and an index that does not exist, as not drawn", () => {
    expect(isDrawn(featured, null, true)).toBe(false);
    expect(isDrawn(featured, 5, true)).toBe(false);
  });
});
