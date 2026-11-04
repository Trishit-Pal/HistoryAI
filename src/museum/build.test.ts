import { describe, expect, it } from "vitest";
import { layoutHalls } from "../domain/layout";
import { seedMuseum } from "../seed/eras";
import { MemoryStore } from "../store/memory";
import { buildMuseumData } from "./build";
import { asPublicExhibits, museumNodes } from "./payload";

describe("buildMuseumData", () => {
  it("keeps Room 0 order and hides drafts", () => {
    const store = seedMuseum();
    store.apply(
      {
        exhibit: {
          id: "draft_hidden",
          title: "Hidden",
          kind: "idea",
          startYear: 1950,
          publicStory: "Not public.",
          publicationState: "draft",
          incomplete: true,
          layer: "context",
          eraId: "era_1_founding",
          confidence: "rumored",
          citations: [{ url: "https://example.com/d", publisher: "Example", retrieved: "2026-10-03" }],
        },
      },
      "editor",
    );
    const data = buildMuseumData(store.snapshot(), { source: "archive", archivedAt: "2026-10-03" });
    const room0 = data.halls.find((hall) => hall.id === "era_0_precursors");
    const expected = layoutHalls(asPublicExhibits(museumNodes(seedMuseum()))).find(
      (hall) => hall.id === "era_0_precursors",
    );
    expect(room0?.exhibitIds).toEqual(expected?.exhibitIds);
    expect(room0?.exhibitIds[0]).toBe("ctx_1843_analytical_engine");
    expect(data.nodes.some((node) => node.id === "draft_hidden")).toBe(false);
    expect(data.exhibits.draft_hidden).toBeUndefined();
    expect(data.changelog.some((line) => line.nodeId === "draft_hidden")).toBe(false);
    expect(data.exhibits.ctx_1843_analytical_engine?.revisions.length).toBeGreaterThan(0);
    // A withdrawn exhibit has no page, but the changelog still names it and says why.
    expect(data.exhibits.evt_history_overview).toBeUndefined();
    const withdrawal = data.changelog.filter((line) => line.nodeId === "evt_history_overview").at(-1);
    expect(withdrawal?.reason).toMatch(/^Withdrawn: /);
    expect(withdrawal?.title).toBe("Mechanical and logical precursors");
  });

  it("keeps a draft that was withdrawn without ever being public out of the changelog", () => {
    const store = seedMuseum();
    const draft = {
      id: "draft_withdrawn",
      title: "Never shown",
      kind: "idea" as const,
      startYear: 1950,
      publicStory: "A draft.",
      publicationState: "draft" as const,
      incomplete: true,
      layer: "context" as const,
      eraId: "era_1_founding" as const,
      confidence: "rumored" as const,
      citations: [{ url: "https://example.com/w", publisher: "Example", retrieved: "2026-11-04" }],
    };
    expect(store.apply({ exhibit: draft }, "editor").ok).toBe(true);
    expect(store.apply({ exhibit: { ...draft, publicationState: "withdrawn" }, reason: "Withdrawn: secret" }, "editor").ok).toBe(true);
    const data = buildMuseumData(store.snapshot(), { source: "archive" });
    expect(data.changelog.some((line) => line.nodeId === "draft_withdrawn")).toBe(false);
    expect(data.changelog.some((line) => line.nodeId === "evt_1987_lisp_collapse")).toBe(true);
    expect(data.source).toBe("archive");
  });
});
