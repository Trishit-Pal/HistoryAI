import { describe, expect, it } from "vitest";
import { layoutHalls } from "../domain/layout";
import { ENTRANCE_PLAQUE_ID } from "../domain/layout";
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
    expect(room0?.exhibitIds[0]).toBe(ENTRANCE_PLAQUE_ID);
    expect(data.nodes.some((node) => node.id === "draft_hidden")).toBe(false);
    expect(data.exhibits.draft_hidden).toBeUndefined();
    expect(data.changelog.some((line) => line.nodeId === "draft_hidden")).toBe(false);
    expect(data.exhibits[ENTRANCE_PLAQUE_ID]?.revisions.length).toBeGreaterThan(0);
    expect(data.source).toBe("archive");
  });
});
