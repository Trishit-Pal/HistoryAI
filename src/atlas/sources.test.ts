import { describe, expect, it } from "vitest";
import { ATLAS_SOURCES, getSource, reusableSources } from "./sources";

describe("atlas source registry", () => {
  it("gives every source an https licence URL, an attribution line and an ISO retrieval date", () => {
    for (const source of ATLAS_SOURCES) {
      expect(source.licenceUrl, source.id).toMatch(/^https:\/\//);
      expect(source.homepage, source.id).toMatch(/^https:\/\//);
      expect(source.attribution.trim().length, source.id).toBeGreaterThan(0);
      expect(source.retrieved, source.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("uses each id once", () => {
    const ids = ATLAS_SOURCES.map((source) => source.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("records Epoch AI as CC BY 4.0 with the citation its README asks for", () => {
    const epoch = getSource("epoch-ai-models");
    expect(epoch.licence).toBe("CC-BY-4.0");
    expect(epoch.linkOnly).toBe(false);
    expect(epoch.attribution).toContain("Epoch AI");
    expect(epoch.attribution).toContain("https://epoch.ai/data/ai-models");
  });

  it("keeps sources whose reuse is not clear as links, never as redrawn data", () => {
    expect(getSource("aiid").linkOnly).toBe(true);
    expect(getSource("stanford-ai-index").linkOnly).toBe(true);
  });

  it("lists only the sources the atlas may draw from", () => {
    const ids = reusableSources().map((source) => source.id);
    expect(ids).toContain("epoch-ai-models");
    expect(ids).not.toContain("aiid");
    expect(ids).not.toContain("stanford-ai-index");
  });

  it("throws for an unknown source id so a typo cannot ship an unattributed mark", () => {
    expect(() => getSource("nope" as never)).toThrow(/nope/);
  });
});
