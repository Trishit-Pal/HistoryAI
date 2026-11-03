import { describe, expect, it } from "vitest";
import { isHttpUrl, isMuseumAssetPath } from "./urls";

describe("isHttpUrl", () => {
  it("accepts http and https", () => {
    expect(isHttpUrl("https://example.com/a")).toBe(true);
    expect(isHttpUrl("http://example.com")).toBe(true);
  });

  it("rejects unsafe or malformed schemes", () => {
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isHttpUrl("JAVASCRIPT:alert(1)")).toBe(false);
    expect(isHttpUrl(" javascript:alert(1)")).toBe(false);
    expect(isHttpUrl("data:text/html,hi")).toBe(false);
    expect(isHttpUrl("vbscript:msg")).toBe(false);
    expect(isHttpUrl("//evil.com")).toBe(false);
    expect(isHttpUrl("https://user:pass@example.com")).toBe(false);
    expect(isHttpUrl(`https://example.com/${"a".repeat(2048)}`)).toBe(false);
    expect(isHttpUrl("")).toBe(false);
  });
});

describe("isMuseumAssetPath", () => {
  it("accepts a museum file path", () => {
    expect(isMuseumAssetPath("/museum/era-0/overview.svg")).toBe(true);
  });

  it("rejects traversal and paths outside the museum", () => {
    expect(isMuseumAssetPath("/museum/../x")).toBe(false);
    expect(isMuseumAssetPath("/museum//x")).toBe(false);
    expect(isMuseumAssetPath("/other/x")).toBe(false);
    expect(isMuseumAssetPath("https://example.com/museum/a.svg")).toBe(false);
  });
});
