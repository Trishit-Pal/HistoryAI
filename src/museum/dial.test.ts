import { describe, expect, it } from "vitest";
import { dialEntries } from "./dial";

const groups = [
  {
    href: (id: string) => `/rooms/deep-learning#${id}`,
    exhibits: [
      { id: "evt_2016_alphago", title: "AlphaGo", startYear: 2016 },
      { id: "evt_2012_alexnet", title: "AlexNet", startYear: 2012 },
      { id: "evt_2014_gan", title: "GANs", startYear: 2014 },
    ],
  },
  { href: (id: string) => `/rooms/precursors#${id}`, exhibits: [{ id: "ctx_1843_analytical_engine", title: "Engine", startYear: 1843 }] },
];

describe("dial", () => {
  it("keeps only exhibits with an artefact, oldest first, with their room link", () => {
    const entries = dialEntries(groups);
    expect(entries.map((e) => e.year)).toEqual([1843, 2012, 2016]);
    expect(entries[1].href).toBe("/rooms/deep-learning#evt_2012_alexnet");
    expect(entries[0].artefact.component).toBe("analyticalEngine");
  });
});
