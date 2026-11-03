import { describe, expect, it } from "vitest";
import { parseExhibitForm } from "./parseForm";

describe("parseExhibitForm", () => {
  it("requires a reason and reads citations as JSON", () => {
    const missing = new FormData();
    missing.set("reason", "no");
    expect(parseExhibitForm(missing).ok).toBe(false);
    const data = new FormData();
    data.set("reason", "Corrected the year");
    data.set("id", "evt_example");
    data.set("title", "Example");
    data.set("kind", "idea");
    data.set("startYear", "1854");
    data.set("publicStory", "A story.");
    data.set("publicationState", "canon");
    data.set("layer", "context");
    data.set("citations", JSON.stringify([{ url: "https://example.com/a", publisher: "Example", retrieved: "2026-10-03" }]));
    const parsed = parseExhibitForm(data);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.write.exhibit?.citations?.[0]?.publisher).toBe("Example");
      expect(parsed.write.mode).toBe("replace");
    }
    data.set("mode", "create");
    data.set("figure", "{not json");
    expect(parseExhibitForm(data)).toEqual({ ok: false, error: "figure is not valid JSON." });
    data.delete("figure");
    const created = parseExhibitForm(data);
    expect(created.ok && created.write.mode).toBe("create");
  });
});
