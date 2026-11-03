import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import snapshotFile from "../../data/atlas-snapshot.json";
import type { AtlasSnapshot } from "../atlas/types";

export const ATLAS_TAG = "atlas";

const snapshot = snapshotFile as AtlasSnapshot;

/** The committed Epoch snapshot. It only changes when `npm run atlas:snapshot` is run and redeployed. */
export async function getAtlas(): Promise<AtlasSnapshot> {
  "use cache";
  cacheTag(ATLAS_TAG);
  cacheLife("max");
  return snapshot;
}
