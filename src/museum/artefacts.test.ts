import { describe, expect, it } from "vitest";
import snapshotFile from "../../data/museum-snapshot.json";
import protein from "./protein-6y4f.json";
import { ARTEFACTS, artefactFor } from "./artefacts";

type SnapshotExhibit = { id: string; confidence?: string; citations: { url: string }[] };
const exhibits = (snapshotFile.snapshot.exhibits as SnapshotExhibit[]).filter((e) => e.confidence === "confirmed");
const byId = new Map(exhibits.map((e) => [e.id, e]));

describe("artefact registry", () => {
  it("places artefacts only on confirmed exhibits", () => {
    for (const id of Object.keys(ARTEFACTS)) expect(byId.has(id), id).toBe(true);
  });

  it("sources every hotspot from the exhibit's citations or the artefact's reference page", () => {
    for (const [id, artefact] of Object.entries(ARTEFACTS)) {
      const allowed = new Set([...byId.get(id)!.citations.map((c) => c.url), artefact.referenceUrl]);
      expect(artefact.hotspots.length, id).toBeGreaterThan(0);
      for (const hotspot of artefact.hotspots) expect(allowed.has(hotspot.sourceUrl), `${id}/${hotspot.id}`).toBe(true);
      expect(new Set(artefact.hotspots.map((h) => h.id)).size, id).toBe(artefact.hotspots.length);
    }
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
