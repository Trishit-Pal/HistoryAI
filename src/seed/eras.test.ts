import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { layoutHalls } from "../domain/layout";
import { CLAIM_ROLES } from "../domain/types";
import { SEED_NODES, seedMuseum } from "./eras";

const ERA0_IDS = [
  "evt_history_overview",
  "ctx_1843_analytical_engine",
  "ctx_1854_boole_laws_of_thought",
  "ctx_1936_turing_computable",
  "ctx_1938_shannon_switching",
  "evt_1943_mcculloch_pitts",
  "ctx_1948_wiener_cybernetics",
  "tech_1948_shannon_information",
];

describe("era seed", () => {
  it("gives every node at least one URL and keeps the 2026 snapshot off the canon", () => {
    expect(SEED_NODES.every((node) => node.citations.some((citation) => citation.url.startsWith("http")))).toBe(true);
    const snapshot = SEED_NODES.find((node) => node.id === "evt_2026_frontier_snapshot");
    expect(snapshot?.publicationState).toBe("provisional");
    expect(snapshot?.confidence).toBe("reported");
    expect(snapshot?.editorialNote).toMatch(/Not canon/);
    const confirmed = SEED_NODES.filter((node) => node.confidence === "confirmed");
    expect(confirmed.every((node) => node.officialPrimary)).toBe(true);
    expect(SEED_NODES.find((node) => node.id === "evt_2025_winter_debate")?.confidence).toBe("disputed");
  });

  it("seeds Room 0 with logged figures and two canon dossiers", () => {
    const store = seedMuseum();
    const log = readFileSync("public/museum/era-0/ASSETS.md", "utf8");
    for (const id of ERA0_IDS) {
      const exhibit = store.getExhibit(id);
      expect(exhibit?.eraId).toBe("era_0_precursors");
      const figure = exhibit?.figure;
      expect(figure?.src).toBeTruthy();
      const line = log.split("\n").find((row) => row.startsWith(`| ${id} |`));
      expect(line).toContain(figure?.src);
      expect(line).toContain(figure?.license);
      expect(line).toContain(figure?.sourceUrl);
    }
    expect(store.getExhibit("ctx_1843_analytical_engine")?.confidence).toBe("reported");
    expect(store.getExhibit("ctx_1843_analytical_engine")?.officialPrimary).toBeUndefined();
    expect(store.getExhibit("evt_history_overview")?.version).toBe(1);
    expect(store.getExhibit("evt_1943_mcculloch_pitts")?.version).toBe(1);
    for (const id of ["evt_1943_mcculloch_pitts", "tech_1948_shannon_information"]) {
      const exhibit = store.getExhibit(id);
      expect(exhibit?.layer).toBe("technical");
      expect(exhibit?.incomplete).toBe(false);
      expect(exhibit?.noPredecessorInScope).toBe(true);
      expect(store.proseFlags(id)).toEqual([]);
      const roles = store.claimsFor(id).map((claim) => claim.role);
      expect(CLAIM_ROLES.every((role) => roles.includes(role))).toBe(true);
    }
    const beforeCanon = store.publicExhibits().filter((exhibit) => exhibit.startYear < 1943);
    expect(beforeCanon.every((exhibit) => exhibit.layer === "context")).toBe(true);
  });

  it("lists era 0 plaque-first and keeps every figure file on disk", () => {
    const store = seedMuseum();
    const publicNodes = store.publicExhibits().map((exhibit) => ({
      id: exhibit.id,
      title: exhibit.title,
      kind: exhibit.kind,
      startYear: exhibit.startYear,
      publicationState: exhibit.publicationState as "canon" | "provisional",
      eraId: exhibit.eraId,
    }));
    const room = layoutHalls(publicNodes).find((hall) => hall.id === "era_0_precursors");
    expect(room?.exhibitIds).toEqual(ERA0_IDS);
    for (const id of ERA0_IDS) {
      const src = store.getExhibit(id)?.figure?.src ?? "";
      expect(existsSync(`public${src}`)).toBe(true);
    }
  });

  it("loads into the store and builds winter plus dense halls", () => {
    const store = seedMuseum();
    const publicNodes = store.publicExhibits().map((exhibit) => ({
      id: exhibit.id,
      title: exhibit.title,
      kind: exhibit.kind,
      startYear: exhibit.startYear,
      publicationState: exhibit.publicationState as "canon" | "provisional",
      eraId: exhibit.eraId,
      layer: exhibit.layer,
    }));
    const halls = layoutHalls(publicNodes);
    expect(halls.some((hall) => hall.mood === "winter")).toBe(true);
    expect(halls.some((hall) => hall.mood === "dense")).toBe(true);
    expect(halls.at(-1)?.id).toBe("provisional");
    expect(store.getExhibit("evt_2026_frontier_snapshot")?.publicationState).toBe("provisional");
  });
});
