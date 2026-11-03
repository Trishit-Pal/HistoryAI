import { describe, expect, it } from "vitest";
import { hasWebGL } from "./env";

describe("hasWebGL", () => {
  it("is false where there is no document", () => {
    expect(hasWebGL()).toBe(false);
  });
});
