import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import snapshotFile from "../../data/museum-snapshot.json";
import { buildMuseumData, preferLive, type MuseumData } from "../museum/build";
import type { MuseumSnapshot } from "../store/memory";
import { db } from "./db";
import { loadGraph } from "./graph";

export const MUSEUM_TAG = "museum";

type SnapshotFile = { generatedAt: string; snapshot: MuseumSnapshot };

const archivedFile = snapshotFile as SnapshotFile;

function fromArchive(): MuseumData {
  return buildMuseumData(archivedFile.snapshot, {
    source: "archive",
    archivedAt: archivedFile.generatedAt,
  });
}

export async function getMuseum(): Promise<MuseumData> {
  "use cache";
  cacheTag(MUSEUM_TAG);
  if (!process.env.DATABASE_URL) {
    cacheLife("max");
    return fromArchive();
  }
  try {
    const live = buildMuseumData(await loadGraph(db(), { publicOnly: true }), { source: "live" });
    const data = preferLive(live, fromArchive);
    if (data !== live) {
      console.warn("The live museum has no public exhibits; serving the archive. Run db:seed or db:audit.");
      cacheLife("minutes");
      return data;
    }
    cacheLife("max");
    return data;
  } catch (error) {
    console.error("Museum read failed; serving the archive", error);
    cacheLife("minutes");
    return fromArchive();
  }
}

export async function getEditorGraph() {
  return loadGraph(db(), { publicOnly: false });
}
