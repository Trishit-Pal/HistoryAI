import { describe, expect, it } from "vitest";
import { lintProse } from "./linter.js";

describe("lintProse", () => {
  it("policy gradient produces no flag", () => {
    expect(lintProse("We train with a policy gradient.")).toEqual([]);
  });

  it("inductive bias produces no flag", () => {
    expect(lintProse("The model has an inductive bias.")).toEqual([]);
  });

  it("job displacement flags out-of-scope-prose", () => {
    expect(lintProse("Studies of job displacement.")).toEqual([
      { rule: "out-of-scope-prose", match: "job displacement" },
    ]);
  });

  it("regulation flags out-of-scope-prose", () => {
    expect(lintProse("A sentence containing regulation of the update.")).toEqual([
      { rule: "out-of-scope-prose", match: "regulation" },
    ]);
  });

  it("racial bias flags even beside a licensed bias phrase", () => {
    expect(lintProse("inductive bias and racial bias")).toEqual([
      { rule: "out-of-scope-prose", match: "racial bias" },
    ]);
  });
});
