import { describe, expect, it } from "vitest";
import type { Figure } from "./types";
import { MemoryStore, type Write } from "../store/memory";

function exhibit(figure?: Figure): Write {
  return {
    exhibit: {
      id: "fig",
      title: "Figure test",
      kind: "idea",
      startYear: 1854,
      publicStory: "A documented precursor with a plate.",
      publicationState: "canon",
      incomplete: false,
      layer: "context",
      eraId: "era_0_precursors",
      confidence: "reported",
      citations: [
        { url: "https://example.com/source", publisher: "Example", retrieved: "2026-10-02" },
      ],
      figure,
    },
  };
}

const redrawn: Figure = {
  src: "/museum/era-0/sample.svg",
  alt: "A redrawn diagram.",
  credit: "Redrawn after the cited source.",
  license: "original",
  sourceUrl: "https://example.com/source",
  kind: "redrawn",
  redrawnAfter: "https://example.com/source",
};

describe("figure field", () => {
  it("stores a valid redrawn figure", () => {
    const store = new MemoryStore();
    const result = store.apply(exhibit(redrawn), "editor");
    expect(result.ok).toBe(true);
    expect(store.getExhibit("fig")?.figure).toEqual(redrawn);
  });

  it("keeps the first version blob when a later write adds a figure", () => {
    const store = new MemoryStore();
    expect(store.apply(exhibit(), "editor").ok).toBe(true);
    expect(store.apply(exhibit(redrawn), "editor").ok).toBe(true);
    expect(store.getExhibit("fig")?.version).toBe(2);
    expect(store.versions("fig")[0]?.blob.figure).toBeUndefined();
    expect(store.versions("fig")[1]?.blob.figure?.src).toBe(redrawn.src);
  });

  it("rejects a figure with no source URL and persists nothing", () => {
    const store = new MemoryStore();
    const before = store.snapshot();
    const result = store.apply(exhibit({ ...redrawn, sourceUrl: "" }), "editor");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.violations.some((item) => item.rule === "invalid-shape")).toBe(true);
    expect(store.snapshot()).toEqual(before);
  });

  it("rejects a license outside the allowlist", () => {
    const store = new MemoryStore();
    const result = store.apply(
      exhibit({ ...redrawn, license: "copyrighted" as Figure["license"] }),
      "editor",
    );
    expect(result.ok).toBe(false);
  });

  it("rejects a redrawn figure with no redrawnAfter", () => {
    const store = new MemoryStore();
    const { redrawnAfter: _dropped, ...rest } = redrawn;
    const result = store.apply(exhibit(rest), "editor");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.violations.some((item) => item.path === "exhibit.figure")).toBe(true);
  });

  it("rejects a figure src that is not a museum path", () => {
    const store = new MemoryStore();
    const result = store.apply(exhibit({ ...redrawn, src: "https://example.com/a.png" }), "editor");
    expect(result.ok).toBe(false);
  });

  it("rejects a data URL and a javascript redraw source", () => {
    const store = new MemoryStore();
    const dataUrl = store.apply(exhibit({ ...redrawn, sourceUrl: "data:text/html,hi" }), "editor");
    expect(dataUrl.ok).toBe(false);
    const script = store.apply(exhibit({ ...redrawn, redrawnAfter: "javascript:alert(1)" }), "editor");
    expect(script.ok).toBe(false);
    expect(store.getExhibit("fig")).toBeUndefined();
  });

  it("accepts a scan without redrawnAfter", () => {
    const store = new MemoryStore();
    const { redrawnAfter: _dropped, ...rest } = redrawn;
    const result = store.apply(exhibit({ ...rest, kind: "scan", license: "PD-old" }), "editor");
    expect(result.ok).toBe(true);
  });
});
