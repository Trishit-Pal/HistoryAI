import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ATLAS_PALETTE, laneColour } from "./theme";

const css = readFileSync(path.resolve("app/atlas/atlas.css"), "utf8");

function cssToken(name: string): string | undefined {
  return new RegExp(`--atlas-${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css)?.[1]?.toLowerCase();
}

describe("atlas theme tokens", () => {
  it.each(Object.entries(ATLAS_PALETTE))("keeps --atlas-%s in atlas.css equal to the 3D palette", (name, hex) => {
    expect(cssToken(name)).toBe(hex.toLowerCase());
  });
});

describe("laneColour", () => {
  it("gives the first nine lanes nine different colours, so domains differ without relying on position", () => {
    const colours = Array.from({ length: 9 }, (_, lane) => laneColour(lane));
    expect(new Set(colours).size).toBe(9);
  });

  it("wraps for lanes past the palette and never returns undefined", () => {
    expect(laneColour(9)).toBe(laneColour(0));
    expect(laneColour(-1)).toBe(laneColour(8));
  });
});
