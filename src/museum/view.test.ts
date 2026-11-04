import { describe, expect, it } from "vitest";
import { seedMuseum } from "../seed/eras";
import { asPublicExhibits, museumHalls, museumNodes } from "./payload";
import { cameraMove, chooseView, nodeIds } from "./view";
import { layoutHalls } from "../domain/layout";

describe("museum views", () => {
  it("snaps the camera when motion is reduced", () => {
    expect(cameraMove(true)).toBe("snap");
    expect(cameraMove(false)).toBe("tween");
  });

  it("uses Flatland when WebGL is missing and keeps the hall when motion is reduced", () => {
    expect(chooseView({ webgl: false, reducedMotion: false })).toBe("flatland");
    expect(chooseView({ webgl: false, reducedMotion: true })).toBe("flatland");
    expect(chooseView({ webgl: true, reducedMotion: true })).toBe("halls");
    expect(chooseView({ webgl: true, reducedMotion: false })).toBe("halls");
  });

  it("shows the same node ids in halls and Flatland", () => {
    const nodes = museumNodes(seedMuseum());
    const hallIds = layoutHalls(asPublicExhibits(nodes)).flatMap((hall) => hall.exhibitIds).sort();
    expect(hallIds).toEqual(nodeIds(nodes));
  });

  it("copies a figure onto the museum node", () => {
    const store = seedMuseum();
    const written = store.apply(
      {
        exhibit: {
          id: "evt_history_overview",
          title: "Mechanical and logical precursors",
          kind: "idea",
          startYear: 1854,
          publicStory: "A framing plaque for the precursor hall.",
          publicationState: "canon",
          incomplete: false,
          layer: "context",
          eraId: "era_0_precursors",
          confidence: "confirmed",
          officialPrimary: true,
          citations: [
            {
              url: "https://plato.stanford.edu/entries/artificial-intelligence/",
              publisher: "Stanford Encyclopedia of Philosophy",
              retrieved: "2026-10-02",
            },
            { url: "https://example.org/second", publisher: "Example", retrieved: "2026-10-02" },
          ],
          figure: {
            src: "/museum/era-0/overview.svg",
            alt: "A stepped line marking the precursor years.",
            credit: "Original illustration for this room.",
            license: "original",
            sourceUrl: "https://plato.stanford.edu/entries/artificial-intelligence/",
            kind: "redrawn",
            redrawnAfter: "https://plato.stanford.edu/entries/artificial-intelligence/",
          },
        },
      },
      "editor",
    );
    expect(written.ok).toBe(true);
    const node = museumNodes(store).find((item) => item.id === "evt_history_overview");
    expect(node?.figure?.src).toBe("/museum/era-0/overview.svg");
  });

  it("keeps a public exhibit that is not confirmed off the floor", () => {
    const store = seedMuseum();
    const written = store.apply(
      {
        exhibit: {
          id: "ctx_reported_only",
          title: "Reported only",
          kind: "idea",
          startYear: 1950,
          publicStory: "One secondary source.",
          publicationState: "canon",
          incomplete: false,
          layer: "context",
          eraId: "era_1_founding",
          confidence: "reported",
          citations: [{ url: "https://example.com/r", publisher: "Example", retrieved: "2026-11-04" }],
        },
      },
      "editor",
    );
    expect(written.ok).toBe(true);
    expect(store.publicExhibits().some((exhibit) => exhibit.id === "ctx_reported_only")).toBe(true);
    expect(museumNodes(store).some((node) => node.id === "ctx_reported_only")).toBe(false);
    expect(museumHalls(store).flatMap((hall) => hall.exhibitIds)).not.toContain("ctx_reported_only");
    expect(museumNodes(store).every((node) => node.confidence === "confirmed")).toBe(true);
  });

  it("exposes a changelog from seeded versions", () => {
    const store = seedMuseum();
    expect(store.changelog().length).toBeGreaterThan(0);
    expect(museumHalls(store).at(-1)?.id).toBe("provisional");
  });
});
