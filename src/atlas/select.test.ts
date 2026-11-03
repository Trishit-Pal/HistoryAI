import { describe, expect, it } from "vitest";
import { FEATURED_COUNT, type SelectionCandidate, scoreOf, selectFeatured } from "./select";

function cand(name: string, year: number, logCompute: number | null, extra: Partial<SelectionCandidate> = {}): SelectionCandidate {
  return { name, year, logCompute, citations: 0, tags: [], frontier: false, foundation: false, paper: "", ...extra };
}

const names = (list: SelectionCandidate[], featured: boolean[]) => list.filter((_, i) => featured[i]).map((c) => c.name);
const NO_FLOORS = { floors: {} };

describe("scoreOf", () => {
  it("rewards citations on a log scale, so a hundred times more citations is not a hundred times the score", () => {
    const few = scoreOf(cand("a", 2015, 20, { citations: 100 }));
    const many = scoreOf(cand("b", 2015, 20, { citations: 10_000 }));
    expect(many).toBeGreaterThan(few);
    expect(many).toBeLessThan(few * 3);
  });

  it("counts the frontier and foundation flags only from 2012, because Epoch tags nearly every old model frontier", () => {
    expect(scoreOf(cand("old", 1965, 8, { frontier: true, foundation: true }))).toBe(scoreOf(cand("old2", 1965, 8)));
    expect(scoreOf(cand("new", 2020, 23, { frontier: true }))).toBeGreaterThan(scoreOf(cand("new2", 2020, 23)));
  });

  it("weights the notability tags and ignores one it does not know", () => {
    const significant = scoreOf(cand("a", 2015, 20, { tags: ["Historical significance"] }));
    const discretionary = scoreOf(cand("b", 2015, 20, { tags: ["Discretionary"] }));
    expect(significant).toBeGreaterThan(discretionary);
    expect(scoreOf(cand("c", 2015, 20, { tags: ["Made up tag"] }))).toBe(scoreOf(cand("d", 2015, 20)));
  });
});

describe("selectFeatured", () => {
  it("always includes a pinned model, even without a compute estimate, and counts it toward the total", () => {
    const list = [
      cand("Deep Blue", 1997, null),
      cand("Record", 2000, 10),
      cand("Squeezed out", 2010, 10.1, { citations: 5000 }),
    ];
    const { featured } = selectFeatured(list, { pins: ["Deep Blue"], excludes: [], count: 2, ...NO_FLOORS });
    expect(names(list, featured)).toEqual(["Deep Blue", "Record"]);
  });

  it("never includes an excluded model, however high it would score", () => {
    const list = [cand("Banned", 2020, 24, { citations: 500_000, frontier: true }), cand("Fine", 2015, 20)];
    const { featured } = selectFeatured(list, { pins: [], excludes: ["Banned"], count: 2, ...NO_FLOORS });
    expect(names(list, featured)).toEqual(["Fine"]);
  });

  it("leaves out models with no compute estimate unless they are pinned", () => {
    const list = [cand("NoCompute", 2015, null, { citations: 90_000 }), cand("HasCompute", 2016, 18)];
    const { featured } = selectFeatured(list, { pins: [], excludes: [], count: 2, ...NO_FLOORS });
    expect(names(list, featured)).toEqual(["HasCompute"]);
  });

  it("always includes a model that beat the previous compute record by a clear margin, and not one that barely did", () => {
    const list = [
      cand("First", 2000, 10),
      cand("Jump", 2005, 12),
      cand("Nudge", 2006, 12.1),
      cand("Weak", 2008, 8),
      cand("Weak2", 2009, 8.5),
    ];
    const { featured, why } = selectFeatured(list, { pins: [], excludes: [], count: 2, ...NO_FLOORS });
    expect(names(list, featured)).toEqual(["First", "Jump"]);
    expect(why[1]).toContain("Largest training run of its day");
  });

  it("fills each era's minimum before spending the rest on the highest scorers", () => {
    const list = [
      cand("Early1", 1960, 6),
      cand("Early2", 1962, 5.5),
      cand("Hit1", 2021, 22, { citations: 100_000 }),
      cand("Hit2", 2022, 22.1, { citations: 90_000 }),
      cand("Hit3", 2023, 22.2, { citations: 80_000 }),
    ];
    const { featured } = selectFeatured(list, {
      pins: [],
      excludes: [],
      count: 3,
      floors: { era_2_symbolic: 2 },
    });
    expect(names(list, featured)).toEqual(["Early1", "Early2", "Hit1"]);
  });

  it("takes what exists when an era has fewer models than its minimum", () => {
    const list = [cand("Only", 1952, 3), cand("Late", 2020, 22)];
    const { featured } = selectFeatured(list, { pins: [], excludes: [], count: 2, floors: { era_1_founding: 5 } });
    expect(names(list, featured)).toEqual(["Only", "Late"]);
  });

  it("does not choose a point that would sit on top of one already chosen", () => {
    const list = [
      cand("Winner", 2020.0, 22, { citations: 50_000 }),
      cand("Twin", 2020.1, 22.2, { citations: 40_000 }),
      cand("Apart", 2020.0, 25, { citations: 1_000 }),
    ];
    const { featured } = selectFeatured(list, { pins: [], excludes: [], count: 2, ...NO_FLOORS });
    expect(names(list, featured)).toEqual(["Winner", "Apart"]);
  });

  it("lets a pinned model overlap another, because a pin is a deliberate choice", () => {
    const list = [cand("Pinned", 2020.0, 22), cand("Twin", 2020.1, 22.2, { citations: 40_000 })];
    const { featured } = selectFeatured(list, { pins: ["Pinned", "Twin"], excludes: [], count: 2, ...NO_FLOORS });
    expect(names(list, featured)).toEqual(["Pinned", "Twin"]);
  });

  it("takes only one row per paper, the highest scoring", () => {
    const list = [
      cand("Small", 2019, 20, { paper: "one paper", citations: 100 }),
      cand("Large", 2019.8, 23, { paper: "one paper", citations: 5000 }),
      cand("Other", 2018, 18, { paper: "another" }),
    ];
    const { featured } = selectFeatured(list, { pins: [], excludes: [], count: 3, ...NO_FLOORS });
    expect(names(list, featured)).toEqual(["Large", "Other"]);
  });

  it("keeps a paper's sibling when the row that would have won the paper is excluded", () => {
    const list = [
      cand("Banned", 2019, 21, { paper: "one paper", citations: 90_000 }),
      cand("Sibling", 2019.5, 22, { paper: "one paper", citations: 10 }),
    ];
    const { featured } = selectFeatured(list, { pins: [], excludes: ["Banned"], count: 2, ...NO_FLOORS });
    expect(names(list, featured)).toEqual(["Sibling"]);
  });

  it("keeps a paper's sibling that has a compute estimate when the best-scoring row has none", () => {
    const list = [
      cand("NoCompute", 2019, null, { paper: "one paper", citations: 90_000 }),
      cand("HasCompute", 2019.5, 22, { paper: "one paper", citations: 10 }),
    ];
    const { featured } = selectFeatured(list, { pins: [], excludes: [], count: 2, ...NO_FLOORS });
    expect(names(list, featured)).toEqual(["HasCompute"]);
  });

  it("keeps every pinned row of a paper, because a pin is deliberate", () => {
    const list = [
      cand("PinA", 2019, 21, { paper: "one paper" }),
      cand("PinB", 2019.5, 22, { paper: "one paper" }),
      cand("Other", 2019.5, 22.2, { paper: "one paper", citations: 90_000 }),
    ];
    const { featured } = selectFeatured(list, { pins: ["PinA", "PinB"], excludes: [], count: 3, ...NO_FLOORS });
    expect(names(list, featured)).toEqual(["PinA", "PinB"]);
  });

  it("prefers the larger model of a paper when the rows score the same", () => {
    const list = [
      cand("Small", 2023.5, 22, { paper: "one paper", citations: 5000 }),
      cand("Large", 2023.5, 24, { paper: "one paper", citations: 5000 }),
    ];
    const { featured } = selectFeatured(list, { pins: [], excludes: [], count: 2, ...NO_FLOORS });
    expect(names(list, featured)).toEqual(["Large"]);
  });

  it("stops filling era minimums once the target is reached, even if the minimums add up to more", () => {
    const list = Array.from({ length: 8 }, (_, i) => cand(`E${i}`, 1960 + i * 2, 5 - i * 0.1));
    const { featured } = selectFeatured(list, { pins: [], excludes: [], count: 3, floors: { era_2_symbolic: 8 } });
    expect(featured.filter(Boolean)).toHaveLength(3);
  });

  it("never returns more than the target and fails loudly when pins plus records exceed it", () => {
    const many = Array.from({ length: 6 }, (_, i) => cand(`M${i}`, 2000 + i * 3, 10 + i * 2));
    expect(() => selectFeatured(many, { pins: [], excludes: [], count: 3, ...NO_FLOORS })).toThrow(/record/i);
    const pinned = many.map((c) => c.name);
    expect(() => selectFeatured(many, { pins: pinned, excludes: [], count: 3, ...NO_FLOORS })).toThrow(/pins/i);
  });

  it("gives every chosen model at least one plain-language reason, and none to the rest", () => {
    const list = [cand("A", 1960, 6), cand("B", 2020, 22, { citations: 50_000 }), cand("C", 2020.05, 22.05)];
    const { featured, why } = selectFeatured(list, { pins: [], excludes: [], count: 2, ...NO_FLOORS });
    list.forEach((_, i) => (featured[i] ? expect(why[i].length).toBeGreaterThan(0) : expect(why[i]).toEqual([])));
    expect(why[1].join(" ")).toMatch(/citations/);
  });

  it("marks pins as the museum's choice", () => {
    const list = [cand("Pinned", 2000, 12)];
    const { why } = selectFeatured(list, { pins: ["Pinned"], excludes: [], count: 1, ...NO_FLOORS });
    expect(why[0][0]).toBe("Chosen by the museum");
  });

  it("returns the same answer for the same input", () => {
    const list = Array.from({ length: 40 }, (_, i) => cand(`M${i}`, 1990 + i, 10 + (i % 7), { citations: i * 300 }));
    const options = { pins: [], excludes: [], count: 10, ...NO_FLOORS };
    expect(selectFeatured(list, options)).toEqual(selectFeatured([...list], options));
  });

  it("targets 80 by default", () => {
    expect(FEATURED_COUNT).toBe(80);
  });
});
