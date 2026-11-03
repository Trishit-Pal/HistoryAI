import { describe, expect, it } from "vitest";
import { ERAS } from "./eras";

describe("era slugs", () => {
  it("gives every era a unique slug", () => {
    const slugs = ERAS.map((era) => era.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs).toContain("precursors");
    expect(slugs).toContain("frontier");
  });
});