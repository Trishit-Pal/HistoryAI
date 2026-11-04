import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { independentDomains } from "../domain/confidence";
import { layoutHalls } from "../domain/layout";
import { CLAIM_ROLES } from "../domain/types";
import { SEED_NODES, seedMuseum } from "./eras";
import { WITHDRAWN_NODES } from "./withdrawn";

const ERA0_IDS = [
  "ctx_1843_analytical_engine",
  "ctx_1854_boole_laws_of_thought",
  "ctx_1936_turing_computable",
  "ctx_1938_shannon_switching",
  "evt_1943_mcculloch_pitts",
  "ctx_1948_wiener_cybernetics",
  "tech_1948_shannon_information",
];

describe("era seed", () => {
  it("confirms every seeded exhibit against a primary record and two domains", () => {
    expect(SEED_NODES.every((node) => node.citations.some((citation) => citation.url.startsWith("http")))).toBe(true);
    for (const node of SEED_NODES) {
      expect(node.confidence, node.id).toBe("confirmed");
      expect(node.officialPrimary, node.id).toBe(true);
      expect(independentDomains(node.citations), node.id).toBeGreaterThanOrEqual(2);
    }
  });

  it("every approved 2018–2026 exhibit is in the seed and confirmed", () => {
    // The owner-approved rows of docs/research-2018-2026.md.
    const approved = [
      "evt_2018_bert",
      "evt_2019_gpt2",
      "evt_2020_gpt3",
      "evt_2021_wudao2",
      "evt_2022_chinchilla",
      "evt_2023_llama",
      "evt_2023_gpt4",
      "evt_2023_qwen",
      "evt_2023_falcon",
      "evt_2023_mistral_7b",
      "evt_2024_o1",
      "evt_2024_deepseek_v3",
      "evt_2025_deepseek_r1",
      "evt_2026_gpt6_astra",
    ];
    const byId = new Map(SEED_NODES.map((node) => [node.id, node]));
    const publicIds = new Set(seedMuseum().publicExhibits().map((exhibit) => exhibit.id));
    for (const id of approved) {
      const node = byId.get(id);
      expect(node, id).toBeDefined();
      expect(node?.confidence, id).toBe("confirmed");
      expect(node?.officialPrimary, id).toBe(true);
      expect(independentDomains(node?.citations ?? []), id).toBeGreaterThanOrEqual(2);
      expect(node?.citations.every((citation) => citation.retrieved === "2026-11-04"), id).toBe(true);
      expect(publicIds.has(id), id).toBe(true);
    }
    // Owner decisions: no GPU count on Astra, and France only with a source that says so.
    expect(byId.get("evt_2026_gpt6_astra")?.publicStory).not.toMatch(/GPU|NVL|rack/i);
    expect(byId.get("evt_2023_mistral_7b")?.citations.map((c) => c.url)).toContain("https://en.wikipedia.org/wiki/Mistral_AI");
  });

  it("keeps the eight withdrawn exhibits off the floor but in the changelog", () => {
    expect(WITHDRAWN_NODES.map((node) => node.id).sort()).toEqual([
      "evt_1974_first_winter",
      "evt_1985_expert_spend",
      "evt_1987_lisp_collapse",
      "evt_2015_google_photos",
      "evt_2017_transformer_citations",
      "evt_2025_winter_debate",
      "evt_2026_frontier_snapshot",
      "evt_history_overview",
    ]);
    const seededIds = new Set(SEED_NODES.map((node) => node.id));
    const store = seedMuseum();
    const publicIds = new Set(store.publicExhibits().map((exhibit) => exhibit.id));
    for (const node of WITHDRAWN_NODES) {
      expect(seededIds.has(node.id)).toBe(false);
      expect(publicIds.has(node.id)).toBe(false);
      expect(store.getExhibit(node.id)?.publicationState).toBe("withdrawn");
      const last = store.changelog().filter((line) => line.nodeId === node.id).at(-1);
      expect(last?.reason).toBe(`Withdrawn: ${node.withdrawnReason}`);
      expect(last?.title).toBe(node.title);
    }
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
    expect(store.getExhibit("ctx_1843_analytical_engine")?.confidence).toBe("confirmed");
    expect(store.getExhibit("ctx_1843_analytical_engine")?.citations?.map((c) => c.url)).toContain(
      "https://archive.org/details/india.history.resource.53369",
    );
    expect(store.getExhibit("evt_history_overview")?.version).toBe(2);
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

  it("lists era 0 in year order and keeps every figure file on disk", () => {
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

  it("gives every exhibit a sourced field change and a second citation when it is canon", () => {
    for (const node of SEED_NODES) {
      expect(node.fieldChange?.before.trim().length).toBeGreaterThan(0);
      expect(node.fieldChange?.after.trim().length).toBeGreaterThan(0);
      const urls = new Set(node.citations.map((citation) => citation.url));
      expect(node.fieldChange?.citationUrls.every((url) => urls.has(url))).toBe(true);
      expect(node.citations.length).toBeGreaterThan(1);
    }
    const store = seedMuseum();
    expect(store.getExhibit("evt_1956_dartmouth")?.fieldChange?.after.length).toBeGreaterThan(0);
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
    // Both eras lost their only exhibit in the November 2026 audit, so they have no hall.
    expect(halls.some((hall) => hall.id === "era_4_expert_systems" || hall.id === "era_5_second_winter")).toBe(false);
  });
});
