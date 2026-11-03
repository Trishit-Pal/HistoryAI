import { describe, expect, it } from "vitest";
import { describeRevision } from "./revisions";

const base = {
  title: "Example",
  publicStory: "A story.",
  technicalAccount: "An account.",
  editorialNote: "",
  publicationState: "canon",
  confidence: "reported" as const,
  citations: [{ url: "https://a.example/1", publisher: "A", retrieved: "2026-10-03" }],
};

describe("describeRevision", () => {
  it("marks the first version as created", () => {
    expect(describeRevision(undefined, base)).toEqual([{ field: "created" }]);
  });

  it("reports confidence, citations, text, and state", () => {
    const next = {
      ...base,
      confidence: "confirmed" as const,
      citations: [{ url: "https://b.example/2", publisher: "B", retrieved: "2026-10-03" }],
      publicStory: "A revised story.",
      publicationState: "provisional",
    };
    expect(describeRevision(base, next)).toEqual([
      { field: "confidence", from: "reported", to: "confirmed" },
      { field: "citations", added: ["B"], removed: ["A"] },
      { field: "publicationState", from: "canon", to: "provisional" },
      { field: "text", parts: ["publicStory"] },
    ]);
  });
});
