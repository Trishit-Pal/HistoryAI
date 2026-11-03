import { describe, expect, it } from "vitest";
import { buildAtlas, firstHttpsUrl, toFractionalYear } from "./build";

function row(overrides: Record<string, string> = {}): Record<string, string> {
  return {
    Model: "Model",
    Domain: "Language",
    Organization: "Lab",
    "Publication date": "2020-01-01",
    Link: "https://example.org/paper",
    Confidence: "Likely",
    "Training compute (FLOP)": "1e21",
    Parameters: "1e9",
    Citations: "",
    "Notability criteria": "",
    "Frontier model": "",
    "Foundation model": "",
    Reference: "",
    ...overrides,
  };
}

const META = { generatedAt: "2026-11-03" };

describe("firstHttpsUrl", () => {
  it("takes the first https URL when Epoch lists several", () => {
    expect(firstHttpsUrl("https://a.org/x,https://b.org/y")).toBe("https://a.org/x");
    expect(firstHttpsUrl("https://a.org/x\nhttps://b.org/y")).toBe("https://a.org/x");
  });

  it("refuses links that carry credentials, which would disguise where they go", () => {
    expect(firstHttpsUrl("https://user:pass@evil.example/")).toBeUndefined();
    expect(firstHttpsUrl("https://trusted.org@evil.example/")).toBeUndefined();
  });

  it("refuses other schemes and malformed hosts, whatever the case", () => {
    expect(firstHttpsUrl("javascript:alert(1)")).toBeUndefined();
    expect(firstHttpsUrl("JAVASCRIPT:alert(1)")).toBeUndefined();
    expect(firstHttpsUrl("https://")).toBeUndefined();
    expect(firstHttpsUrl("https:///path")).toBeUndefined();
  });

  it("accepts an upper-case scheme and writes the link back in its normal form", () => {
    expect(firstHttpsUrl("HTTPS://Example.org/Paper")).toBe("https://example.org/Paper");
  });

  it("returns undefined for blank, http and non-URL values", () => {
    expect(firstHttpsUrl("")).toBeUndefined();
    expect(firstHttpsUrl("http://a.org/x")).toBeUndefined();
    expect(firstHttpsUrl("see paper")).toBeUndefined();
  });
});

describe("toFractionalYear", () => {
  it("places a date inside its year", () => {
    expect(toFractionalYear("2020-01-01")).toBeCloseTo(2020, 3);
    expect(toFractionalYear("2020-07-02")).toBeGreaterThan(2020.4);
    expect(toFractionalYear("2020-07-02")).toBeLessThan(2020.6);
  });

  it("rejects dates that are blank or not real", () => {
    expect(toFractionalYear("")).toBeUndefined();
    expect(toFractionalYear("2020-13-40")).toBeUndefined();
    expect(toFractionalYear("last spring")).toBeUndefined();
  });
});

describe("buildAtlas", () => {
  it("keeps a model that has a date, a link and a metric, and takes logs of the values", () => {
    const atlas = buildAtlas([row({ Model: "A", "Training compute (FLOP)": "1e21", Parameters: "1000" })], META);
    expect(atlas.models.count).toBe(1);
    expect(atlas.models.names).toEqual(["A"]);
    expect(atlas.models.logCompute[0]).toBeCloseTo(21, 3);
    expect(atlas.models.logParameters[0]).toBeCloseTo(3, 3);
    expect(atlas.models.links[0]).toBe("https://example.org/paper");
    expect(atlas.models.epochConfidence[0]).toBe("Likely");
  });

  it("leaves a missing metric as null instead of inventing a value", () => {
    const atlas = buildAtlas([row({ "Training compute (FLOP)": "", Parameters: "1e6" })], META);
    expect(atlas.models.logCompute[0]).toBeNull();
    expect(atlas.models.logParameters[0]).toBeCloseTo(6, 3);
  });

  it("treats zero, negative and non-numeric values as missing because they have no log", () => {
    const atlas = buildAtlas(
      [
        row({ Model: "zero", "Training compute (FLOP)": "0", Parameters: "5" }),
        row({ Model: "neg", "Training compute (FLOP)": "-3", Parameters: "5" }),
        row({ Model: "text", "Training compute (FLOP)": "n/a", Parameters: "5" }),
      ],
      META,
    );
    expect(atlas.models.logCompute).toEqual([null, null, null]);
  });

  it("drops rows with no date, no usable link, or neither metric", () => {
    const atlas = buildAtlas(
      [
        row({ Model: "kept" }),
        row({ Model: "no-date", "Publication date": "" }),
        row({ Model: "no-link", Link: "" }),
        row({ Model: "http-only", Link: "http://old.example/paper" }),
        row({ Model: "no-metric", "Training compute (FLOP)": "", Parameters: "" }),
      ],
      META,
    );
    expect(atlas.models.names).toEqual(["kept"]);
  });

  it("counts every input row in the totals, plotted or not", () => {
    const atlas = buildAtlas(
      [
        row({ Model: "a", Parameters: "" }),
        row({ Model: "b", "Training compute (FLOP)": "" }),
        row({ Model: "c", Link: "" }),
      ],
      META,
    );
    expect(atlas.totals).toEqual({ rows: 3, plotted: 2, withCompute: 1, withParameters: 1, featured: 1 });
  });

  it("sorts oldest first so output is stable across runs", () => {
    const atlas = buildAtlas(
      [
        row({ Model: "late", "Publication date": "2024-05-05" }),
        row({ Model: "early", "Publication date": "1999-03-03" }),
        row({ Model: "mid", "Publication date": "2010-01-01" }),
      ],
      META,
    );
    expect(atlas.models.names).toEqual(["early", "mid", "late"]);
  });

  it("uses a model's first listed domain, and folds rare domains into Other", () => {
    const common = Array.from({ length: 7 }, (_, i) => `Domain${i}`);
    const rows = common.flatMap((domain) =>
      [1, 2, 3].map((n) => row({ Model: `${domain}-${n}`, Domain: `${domain},Vision` })),
    );
    rows.push(row({ Model: "rare", Domain: "Obscure" }));
    rows.push(row({ Model: "blank", Domain: "" }));
    const atlas = buildAtlas(rows, META);
    const labelOf = (name: string) => atlas.domains[atlas.models.domainIndex[atlas.models.names.indexOf(name)]];
    expect(labelOf("Domain0-1")).toBe("Domain0");
    expect(labelOf("rare")).toBe("Other");
    expect(labelOf("blank")).toBe("Not stated");
    expect(atlas.domains.length).toBeLessThanOrEqual(9);
  });

  it("records where the data came from", () => {
    const atlas = buildAtlas([row()], META);
    expect(atlas.sourceId).toBe("epoch-ai-models");
    expect(atlas.generatedAt).toBe("2026-11-03");
  });

  it("features models and gives each a reason, while keeping every plotted row", () => {
    const atlas = buildAtlas(
      [
        row({ Model: "Big", "Publication date": "2020-01-01", "Training compute (FLOP)": "1e24", Citations: "50000" }),
        row({ Model: "NoCompute", "Training compute (FLOP)": "", Parameters: "1e6" }),
      ],
      META,
    );
    expect(atlas.models.count).toBe(2);
    expect(atlas.models.featured).toEqual([true, false]);
    expect(atlas.models.why[atlas.models.names.indexOf("Big")]).toContain("50k citations");
    expect(atlas.models.why[atlas.models.names.indexOf("NoCompute")]).toEqual([]);
    expect(atlas.totals.featured).toBe(1);
  });

  it("reads Epoch's citation count, notability tags, flags and paper title, tolerating blanks and junk", () => {
    const atlas = buildAtlas(
      [
        row({ Model: "Tagged", Citations: "not a number", "Notability criteria": "Historical significance, Significant use", "Frontier model": "TRUE" }),
      ],
      META,
    );
    expect(atlas.models.featured).toEqual([true]);
    expect(atlas.models.why[0]).toContain("Historically significant");
  });

  it("keeps every column the same length", () => {
    const atlas = buildAtlas([row({ Model: "a" }), row({ Model: "b" })], META);
    for (const column of Object.values(atlas.models)) {
      if (Array.isArray(column)) expect(column.length).toBe(atlas.models.count);
    }
  });
});
