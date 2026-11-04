import { describe, expect, it } from "vitest";
import snapshotFile from "../../data/globe-snapshot.json";
import type { GlobeSnapshot } from "../../src/globe/types";
import { byYear, countLine, firstYear, flopPower, times, yearLabel } from "./format";

const snapshot = snapshotFile as GlobeSnapshot;

describe("globe copy", () => {
  it("gives the note, not a count, before the first large-scale model", () => {
    expect(countLine(snapshot, 2018)).toEqual({ text: "No model at this scale yet. The first arrives in 2019.", growth: null });
  });

  it("counts labs and countries once there are models", () => {
    const line = countLine(snapshot, 2025);
    expect(line.text).toMatch(/^2025: \d+ labs in (2[1-9]|[3-9]\d) countries$/);
    expect(line.growth).toEqual({ power: 10, more: true, since: 2012 });
  });

  it("formats powers, multipliers and the cutoff year", () => {
    expect(flopPower(23.857)).toBe("23.9");
    expect(times(7.656)).toBe("×7.7");
    expect(times(17.38)).toBe("×17");
    expect(yearLabel(2026)).toBe("2026, to 1 November");
    expect(yearLabel(2023)).toBe("2023");
    expect(byYear(2026)).toBe("by 1 Nov 2026");
    expect(byYear(2023)).toBe("by the end of 2023");
    expect(firstYear(snapshot)).toBe(2019);
  });
});
