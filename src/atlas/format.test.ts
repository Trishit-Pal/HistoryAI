import { describe, expect, it } from "vitest";
import { formatCompute, formatParameters } from "./format";

describe("formatCompute", () => {
  it("writes training compute as a mantissa and a power of ten", () => {
    expect(formatCompute(21)).toBe("1.0 × 10^21 FLOP");
    expect(formatCompute(Math.log10(2.5e23))).toBe("2.5 × 10^23 FLOP");
  });

  it("carries into the next power when rounding reaches ten", () => {
    expect(formatCompute(20.9999)).toBe("1.0 × 10^21 FLOP");
  });

  it("says so when there is no estimate", () => {
    expect(formatCompute(null)).toBe("No estimate published");
  });
});

describe("formatParameters", () => {
  it("scales the count to a readable unit", () => {
    expect(formatParameters(Math.log10(40))).toBe("40");
    expect(formatParameters(Math.log10(2_500))).toBe("2.5 K");
    expect(formatParameters(Math.log10(340_000_000))).toBe("340 M");
    expect(formatParameters(Math.log10(175_000_000_000))).toBe("175 B");
    expect(formatParameters(Math.log10(1.8e12))).toBe("1.8 T");
  });

  it("says so when there is no count", () => {
    expect(formatParameters(null)).toBe("No count published");
  });
});
