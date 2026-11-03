import { describe, expect, it } from "vitest";
import { precursorsLayout, precursorsCameraY } from "./precursorsRoom";

describe("precursors layout", () => {
  it("places the plaque in front and the works on rising terraces", () => {
    const spots = precursorsLayout([
      "evt_history_overview",
      "ctx_1843_analytical_engine",
      "ctx_1854_boole_laws_of_thought",
      "ctx_1936_turing_computable",
      "ctx_1938_shannon_switching",
      "evt_1943_mcculloch_pitts",
      "ctx_1948_wiener_cybernetics",
      "tech_1948_shannon_information",
      "ctx_1949_extra",
    ]);
    expect(spots[0]).toEqual({ id: "evt_history_overview", x: 0, y: 0, z: 1.8 });
    expect(spots[1]).toEqual({ id: "ctx_1843_analytical_engine", x: -1.2, y: 0, z: 0 });
    expect(spots[2]).toMatchObject({ id: "ctx_1854_boole_laws_of_thought", x: 1.2, y: 0.18, z: -1.8 });
    expect(spots.at(-1)).toMatchObject({ id: "ctx_1949_extra", y: 1.26, z: -12.6 });
  });

  it("treats the first id as station 0 when the plaque is absent", () => {
    const spots = precursorsLayout(["ctx_1843_analytical_engine", "ctx_1854_boole_laws_of_thought"]);
    expect(spots[0]).toMatchObject({ id: "ctx_1843_analytical_engine", y: 0, z: 0 });
  });

  it("lifts the camera with the terrace", () => {
    expect(precursorsCameraY(0.18)).toBeCloseTo(1.78);
    expect(precursorsCameraY(null)).toBe(1.6);
  });
});
