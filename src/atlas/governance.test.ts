import { describe, expect, it } from "vitest";
import { seedMuseum } from "../seed/eras";
import { GOVERNANCE, OFFICIAL_HOSTS, governanceViews, governanceX } from "./governance";
import { xOfYear } from "./projection";

const exhibitIds = new Set(seedMuseum().snapshot().exhibits.map((exhibit) => exhibit.id));

describe("governance markers", () => {
  it("gives every marker a real ISO date, a title, an issuer and an https source", () => {
    for (const marker of GOVERNANCE) {
      expect(marker.date, marker.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(marker.date)), marker.id).toBe(false);
      expect(marker.title.trim().length, marker.id).toBeGreaterThan(0);
      expect(marker.issuer.trim().length, marker.id).toBeGreaterThan(0);
      expect(marker.short.trim().length, marker.id).toBeGreaterThan(0);
      expect(marker.short.length, marker.id).toBeLessThanOrEqual(28);
      expect(marker.url, marker.id).toMatch(/^https:\/\//);
    }
  });

  it("links only to the issuing body's own site", () => {
    for (const marker of GOVERNANCE) {
      const host = new URL(marker.url).hostname.replace(/^www\./, "");
      expect(OFFICIAL_HOSTS, marker.id).toContain(host);
    }
  });

  it("uses each id once and lists markers oldest first", () => {
    const ids = GOVERNANCE.map((marker) => marker.id);
    expect(new Set(ids).size).toBe(ids.length);
    const dates = GOVERNANCE.map((marker) => marker.date);
    expect([...dates].sort()).toEqual(dates);
  });

  it("points only at exhibits that exist", () => {
    for (const marker of GOVERNANCE) {
      if (marker.exhibitId) expect(exhibitIds.has(marker.exhibitId), marker.id).toBe(true);
    }
  });

  it("places a marker on the year axis by its date", () => {
    const marker = GOVERNANCE[0];
    const year = Number(marker.date.slice(0, 4));
    expect(governanceX(marker)).toBeGreaterThanOrEqual(xOfYear(year));
    expect(governanceX(marker)).toBeLessThanOrEqual(xOfYear(year + 1));
  });
});

describe("governanceViews", () => {
  const exhibits = [{ id: "evt_2024_eu_ai_act", title: "EU AI Act", eraId: "era_10_frontier" as const }];

  it("links the EU AI Act marker to its exhibit through the era slug", () => {
    const view = governanceViews(exhibits).find((v) => v.id === "eu-ai-act");
    expect(view?.exhibit).toEqual({
      id: "evt_2024_eu_ai_act",
      title: "EU AI Act",
      href: "/rooms/frontier/evt_2024_eu_ai_act",
    });
  });

  it("leaves markers without an exhibit unlinked and keeps every marker", () => {
    const views = governanceViews(exhibits);
    expect(views).toHaveLength(GOVERNANCE.length);
    expect(views.find((v) => v.id === "oecd-ai-principles")?.exhibit).toBeUndefined();
  });
});
