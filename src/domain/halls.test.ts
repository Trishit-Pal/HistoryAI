import { describe, expect, it } from "vitest";
import { layoutHalls, type PublicExhibit } from "./layout";

function node(
  id: string,
  startYear: number,
  eraId: PublicExhibit["eraId"],
  publicationState: PublicExhibit["publicationState"] = "canon",
): PublicExhibit {
  return { id, title: id, kind: "idea", startYear, publicationState, eraId };
}

describe("layoutHalls", () => {
  it("groups by era and appends an empty provisional hall", () => {
    const halls = layoutHalls([
      node("a", 1950, "era_1_founding"),
      node("b", 1956, "era_1_founding"),
      node("c", 1973, "era_3_first_winter"),
      node("d", 2012, "era_7_deep_learning"),
    ]);
    expect(halls.map((hall) => hall.id)).toEqual([
      "era_1_founding",
      "era_3_first_winter",
      "era_7_deep_learning",
      "provisional",
    ]);
    expect(halls.at(-1)?.exhibitIds).toEqual([]);
  });

  it("narrows and dims winter halls and tightens later halls", () => {
    const halls = layoutHalls([
      node("w", 1974, "era_3_first_winter"),
      node("d", 2017, "era_8_transformers"),
    ]);
    const winter = halls.find((hall) => hall.id === "era_3_first_winter");
    const dense = halls.find((hall) => hall.id === "era_8_transformers");
    expect(winter?.mood).toBe("winter");
    expect(winter?.width).toBeLessThan(dense?.width ?? 0);
    expect(winter?.light).toBeLessThan(dense?.light ?? 0);
    expect(dense?.spacing).toBeLessThan(winter?.spacing ?? 0);
  });

  it("puts the entrance plaque first in era 0 and keeps the earliest year", () => {
    const halls = layoutHalls([
      node("ctx_1854_boole", 1854, "era_0_precursors"),
      node("evt_history_overview", 1854, "era_0_precursors"),
      node("ctx_1843_analytical_engine", 1843, "era_0_precursors"),
    ]);
    const room = halls.find((hall) => hall.id === "era_0_precursors");
    expect(room?.exhibitIds).toEqual([
      "evt_history_overview",
      "ctx_1843_analytical_engine",
      "ctx_1854_boole",
    ]);
    expect(room?.startYear).toBe(1843);
  });

  it("does not move an earlier exhibit to the front of another era", () => {
    const halls = layoutHalls([
      node("later", 1956, "era_1_founding"),
      node("earlier", 1950, "era_1_founding"),
    ]);
    expect(halls.find((hall) => hall.id === "era_1_founding")?.exhibitIds).toEqual(["earlier", "later"]);
  });

  it("keeps provisional cards in the last hall", () => {
    const halls = layoutHalls([
      node("a", 1956, "era_1_founding"),
      node("p", 2024, "era_10_frontier", "provisional"),
    ]);
    expect(halls.find((hall) => hall.id === "era_1_founding")?.exhibitIds).toEqual(["a"]);
    expect(halls.find((hall) => hall.id === "provisional")?.exhibitIds).toEqual(["p"]);
  });
});
