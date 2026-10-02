import { describe, expect, it } from "vitest";
import { MemoryStore, type Write } from "../store/memory";

function contextWrite(overrides: Partial<NonNullable<Write["exhibit"]>> = {}): Write {
  return {
    exhibit: {
      id: "ctx",
      title: "Lighthill Report",
      kind: "turning_point",
      startYear: 1973,
      publicStory: "A UK review concluded that AI had not produced the promised impact.",
      publicationState: "canon",
      incomplete: false,
      layer: "context",
      eraId: "era_3_first_winter",
      confidence: "reported",
      citations: [
        {
          url: "https://www.holloway.com/g/making-things-think/sections/the-first-ai-winter-19741980",
          publisher: "Holloway",
          retrieved: "2026-09-27",
        },
      ],
      tags: ["funding"],
      ...overrides,
    },
  };
}

describe("context layer and versions", () => {
  it("allows a context exhibit before 1943", () => {
    const store = new MemoryStore();
    const result = store.apply(
      contextWrite({
        id: "boole",
        title: "Boolean algebra",
        startYear: 1854,
        eraId: "era_0_precursors",
        publicStory: "Boole's algebra of logic is a documented precursor in AI-history overviews.",
        citations: [
          {
            url: "https://en.wikipedia.org/wiki/History_of_artificial_intelligence",
            publisher: "Wikipedia",
            retrieved: "2026-09-27",
          },
        ],
      }),
      "editor",
    );
    expect(result.ok).toBe(true);
    expect(store.getExhibit("boole")?.startYear).toBe(1854);
  });

  it("still forbids a technical exhibit before 1943", () => {
    const store = new MemoryStore();
    const before = store.snapshot();
    const result = store.apply(
      {
        exhibit: {
          id: "early",
          title: "Too early",
          kind: "idea",
          startYear: 1942,
          publicStory: "Before the canon.",
          publicationState: "draft",
          incomplete: true,
          layer: "technical",
        },
      },
      "editor",
    );
    expect(result.ok).toBe(false);
    expect(store.snapshot()).toEqual(before);
  });

  it("rejects a context exhibit with no citation URL", () => {
    const store = new MemoryStore();
    const result = store.apply(contextWrite({ citations: [] }), "editor");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.violations.some((v) => v.rule === "invalid-shape")).toBe(true);
  });

  it("does not run the technical prose linter on context copy", () => {
    const store = new MemoryStore();
    const result = store.apply(
      contextWrite({
        publicStory: "The report led to regulation of research funding in the UK.",
      }),
      "editor",
    );
    expect(result.ok).toBe(true);
    expect(store.proseFlags("ctx")).toEqual([]);
  });

  it("rejects confirmed when only one secondary URL is present", () => {
    const store = new MemoryStore();
    const result = store.apply(contextWrite({ confidence: "confirmed" }), "editor");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.violations.some((v) => v.rule === "source-rule")).toBe(true);
  });

  it("rejects confirmed on a technical exhibit with one citation", () => {
    const store = new MemoryStore();
    const result = store.apply(
      {
        exhibit: {
          id: "tech",
          title: "A paper",
          kind: "idea",
          startYear: 1943,
          publicStory: "A short public story.",
          technicalAccount: "A technical account of the method.",
          publicationState: "draft",
          incomplete: true,
          layer: "technical",
          confidence: "confirmed",
          officialPrimary: true,
          citations: [{ url: "https://example.com/paper", publisher: "Example", retrieved: "2026-10-02" }],
        },
      },
      "editor",
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.violations.some((item) => item.rule === "source-rule")).toBe(true);
  });

  it("rejects a citation swap that would leave confirmed standing", () => {
    const store = new MemoryStore();
    expect(
      store.apply(
        contextWrite({
          confidence: "confirmed",
          officialPrimary: true,
          citations: [
            { url: "https://a.example/1", publisher: "A", retrieved: "2026-10-02" },
            { url: "https://b.example/2", publisher: "B", retrieved: "2026-10-02" },
          ],
        }),
        "editor",
      ).ok,
    ).toBe(true);
    const next = contextWrite({
      citations: [{ url: "https://a.example/1", publisher: "A", retrieved: "2026-10-02" }],
    });
    if (next.exhibit) {
      delete next.exhibit.confidence;
      delete next.exhibit.officialPrimary;
    }
    const result = store.apply(next, "editor");
    expect(result.ok).toBe(false);
  });

  it("rejects a layer change on an existing exhibit", () => {
    const store = new MemoryStore();
    store.apply(
      {
        exhibit: {
          id: "tech",
          title: "A paper",
          kind: "idea",
          startYear: 1943,
          publicStory: "A short public story.",
          publicationState: "draft",
          incomplete: true,
          layer: "technical",
        },
      },
      "editor",
    );
    const result = store.apply(
      {
        exhibit: {
          id: "tech",
          title: "A paper",
          kind: "idea",
          startYear: 1943,
          publicStory: "A short public story.",
          publicationState: "draft",
          incomplete: true,
          layer: "context",
          citations: [{ url: "https://example.com/a", publisher: "Example", retrieved: "2026-10-02" }],
          confidence: "reported",
        },
      },
      "editor",
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.violations.some((item) => item.rule === "forbidden-transition")).toBe(true);
  });

  it("keeps the previous blob when a second write bumps version", () => {
    const store = new MemoryStore();
    store.apply(contextWrite(), "editor");
    expect(store.getExhibit("ctx")?.version).toBe(1);
    const first = store.getExhibit("ctx");
    const second = store.apply(
      {
        ...contextWrite({
          publicStory: "Updated wording of the Lighthill conclusion.",
        }),
        expectedUpdatedAt: first?.updatedAt,
      },
      "editor",
    );
    expect(second.ok).toBe(true);
    expect(store.getExhibit("ctx")?.version).toBe(2);
    const versions = store.versions("ctx");
    expect(versions).toHaveLength(2);
    expect(versions[0]?.blob.publicStory).toContain("promised impact");
    expect(store.changelog().some((line) => line.nodeId === "ctx" && line.version === 2)).toBe(true);
  });
});
