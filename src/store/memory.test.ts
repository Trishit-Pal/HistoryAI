import { describe, expect, it } from "vitest";
import { MemoryStore } from "./memory";

function exhibit() {
  return {
    id: "ex",
    title: "Example",
    kind: "idea" as const,
    startYear: 1854,
    publicStory: "A precursor.",
    publicationState: "canon" as const,
    incomplete: false,
    layer: "context" as const,
    confidence: "reported" as const,
    citations: [{ url: "https://example.com/a", publisher: "Example", retrieved: "2026-10-03" }],
  };
}

describe("MemoryStore snapshots", () => {
  it("round-trips a snapshot and stores the reason", () => {
    const store = new MemoryStore();
    expect(store.apply({ exhibit: exhibit(), reason: "First published" }, "editor").ok).toBe(true);
    expect(
      store.apply(
        { exhibit: { ...exhibit(), publicStory: "A revised precursor." }, reason: "Fixed the year", suggestionId: "sug-1" },
        "editor",
      ).ok,
    ).toBe(true);
    const copy = MemoryStore.fromSnapshot(store.snapshot());
    expect(copy.getExhibit("ex")?.publicStory).toBe("A revised precursor.");
    expect(copy.changelog().at(-1)?.reason).toBe("Fixed the year");
    expect(copy.versions("ex")[1]?.suggestionId).toBe("sug-1");
    expect(copy.changelog()).toEqual(store.changelog());
  });
});
