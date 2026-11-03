import { GOVERNANCE } from "./governance";
import { hashForModel } from "./hash";
import { LANDMARKS } from "./mapping";

export const ATLAS_PATH = "/atlas";

/**
 * Where an exhibit appears in the atlas, or nothing if it does not. A landmark model opens the
 * atlas focused on it; a governance marker opens the atlas, where its pin stands on the rail.
 */
export function atlasLinkFor(exhibitId: string): string | undefined {
  const landmark = LANDMARKS.find((candidate) => candidate.exhibitId === exhibitId);
  if (landmark) return `${ATLAS_PATH}${hashForModel(landmark.model)}`;
  if (GOVERNANCE.some((marker) => marker.exhibitId === exhibitId)) return ATLAS_PATH;
  return undefined;
}
