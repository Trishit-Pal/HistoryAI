import { describe, expect, it } from "vitest";
import { parseSuggestion } from "./parse";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe("parseSuggestion", () => {
  it("accepts a correction and rejects a bad link", () => {
    const ok = parseSuggestion(
      form({
        exhibitId: "evt_history_overview",
        kind: "correction",
        body: "The year on the plate does not match the cited paper.",
        turnstileToken: "token",
      }),
    );
    expect(ok.ok).toBe(true);
    const bad = parseSuggestion(
      form({
        exhibitId: "evt_history_overview",
        kind: "source",
        body: "This page is the publisher scan of the same work.",
        sourceUrl: "javascript:alert(1)",
      }),
    );
    expect(bad.ok).toBe(false);
  });

  it("keeps the honeypot value for the caller to ignore", () => {
    const parsed = parseSuggestion(
      form({
        exhibitId: "evt_history_overview",
        kind: "correction",
        body: "The year on the plate does not match the cited paper.",
        website: "spam",
      }),
    );
    expect(parsed.ok && parsed.value.honeypot).toBe("spam");
  });
});