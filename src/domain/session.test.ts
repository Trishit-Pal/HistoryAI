import { describe, expect, it } from "vitest";
import { editorEnabled, passphraseMatches, signSession, verifySession } from "./session";

describe("editor session", () => {
  it("matches a passphrase without leaking length", () => {
    expect(passphraseMatches("correct horse battery staple long", "correct horse battery staple long")).toBe(true);
    expect(passphraseMatches("nope", "correct horse battery staple long")).toBe(false);
    expect(passphraseMatches("short", "longer-than-short")).toBe(false);
  });

  it("requires 32 characters before the editor turns on", () => {
    expect(editorEnabled(undefined)).toBe(false);
    expect(editorEnabled("too-short")).toBe(false);
    expect(editorEnabled("x".repeat(32))).toBe(true);
  });

  it("rejects a tampered, expired, or wrong-secret token", () => {
    const secret = "a".repeat(32);
    const token = signSession(secret, 1_000);
    expect(verifySession(token, secret, 1_000)).toBe(true);
    expect(verifySession(token, "b".repeat(32), 1_000)).toBe(false);
    expect(verifySession(`${token}x`, secret, 1_000)).toBe(false);
    expect(verifySession(token, secret, 1_000 + 8 * 60 * 60 * 1000)).toBe(false);
  });
});
