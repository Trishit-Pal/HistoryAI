import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CONFIDENCE_GLYPH, PALETTE } from "./theme";

const css = readFileSync(path.resolve("app/globals.css"), "utf8");

function cssToken(name: string): string | undefined {
  return new RegExp(`--bp-${name}:\\s*(#[0-9a-fA-F]{6})`).exec(css)?.[1]?.toLowerCase();
}

describe("theme tokens", () => {
  it.each(Object.entries(PALETTE))("keeps --bp-%s in globals.css equal to the 3D palette", (name, hex) => {
    expect(cssToken(name)).toBe(hex.toLowerCase());
  });

  it.each(Object.entries(CONFIDENCE_GLYPH))("draws the %s badge glyph in globals.css", (word, glyph) => {
    const rule = new RegExp(
      `:is\\(\\.shell, \\.exhibit-page\\) \\.badge-${word}::before\\s*\\{\\s*content:\\s*"${glyph}"`,
    );
    expect(css).toMatch(rule);
  });

  it("gives every confidence word, and unset, its own shape so colour is never the only cue", () => {
    const glyphs = Object.values(CONFIDENCE_GLYPH);
    expect(Object.keys(CONFIDENCE_GLYPH).sort()).toEqual(["confirmed", "disputed", "reported", "rumored", "unset"]);
    expect(new Set(glyphs).size).toBe(glyphs.length);
  });
});
