import { describe, expect, it } from "vitest";
import snapshotFile from "../../data/museum-snapshot.json";
import protein from "./protein-6y4f.json";
import { ARTEFACTS, artefactFor, creditParts } from "./artefacts";

type SnapshotExhibit = { id: string; confidence?: string; citations: { url: string }[] };
const exhibits = (snapshotFile.snapshot.exhibits as SnapshotExhibit[]).filter((e) => e.confidence === "confirmed");
const byId = new Map(exhibits.map((e) => [e.id, e]));

describe("artefact registry", () => {
  it("places artefacts only on confirmed exhibits", () => {
    for (const id of Object.keys(ARTEFACTS)) expect(byId.has(id), id).toBe(true);
  });

  it("sources every hotspot from the exhibit's citations, the reference page or the maker's page", () => {
    for (const [id, artefact] of Object.entries(ARTEFACTS)) {
      const pages = [artefact.referenceUrl, ...(artefact.partsUrl ? [artefact.partsUrl] : [])];
      const allowed = new Set([...byId.get(id)!.citations.map((c) => c.url), ...pages]);
      expect(artefact.hotspots.length, id).toBeGreaterThan(0);
      for (const hotspot of artefact.hotspots) expect(allowed.has(hotspot.sourceUrl), `${id}/${hotspot.id}`).toBe(true);
      expect(new Set(artefact.hotspots.map((h) => h.id)).size, id).toBe(artefact.hotspots.length);
    }
  });

  it("credits every replica's reference with its author and licence", () => {
    for (const [id, artefact] of Object.entries(ARTEFACTS)) {
      const credit = creditParts(artefact);
      const line = `${credit.before}${credit.title}${credit.after}`;
      if (artefact.kind === "replica") {
        expect(line, id).toContain(`by ${artefact.author}, ${artefact.licence}`);
        expect(line.startsWith("Replica of "), id).toBe(true);
      } else {
        expect(line, id).toContain("CC0");
      }
    }
  });

  it("places no Go stone, since no source gives Move 37's point", () => {
    expect(ARTEFACTS.evt_2016_alphago.hotspots.map((h) => h.id)).toEqual(["grid"]);
  });

  it("allows a maker's page only for the rack, and only NVIDIA's GB200 NVL72 page", () => {
    const withParts = Object.entries(ARTEFACTS).filter(([, artefact]) => artefact.partsUrl !== undefined);
    expect(withParts.map(([id]) => id)).toEqual(["evt_2026_gpt6_astra"]);
    const url = new URL(withParts[0][1].partsUrl!);
    expect(url.hostname).toBe("www.nvidia.com");
    expect(url.href).toBe("https://www.nvidia.com/en-us/data-center/gb200-nvl72/");
  });

  it("never ties the rack to Astra or counts Astra's hardware", () => {
    const rack = ARTEFACTS.evt_2026_gpt6_astra;
    const credit = creditParts(rack);
    expect(`${credit.before}${credit.title}${credit.after}`).not.toMatch(/Astra|\b\d[\d,.]*\s+(GPUs?|racks?|chips?)/i);
    for (const hotspot of rack.hotspots) expect(hotspot.text, hotspot.id).not.toMatch(/Astra|OpenAI|100K/i);
  });

  it("returns nothing for exhibits without an artefact, including prototype keys", () => {
    expect(artefactFor("evt_1966_eliza")).toBeUndefined();
    expect(artefactFor("toString")).toBeUndefined();
  });

  it("ships a C-alpha trace with three coordinates per residue", () => {
    expect(protein.id).toBe("6Y4F");
    expect(protein.ca.length).toBe(protein.residues.length * 3);
  });
});
