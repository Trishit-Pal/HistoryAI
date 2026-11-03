import { eraById } from "../domain/eras";
import type { EraId } from "../domain/types";
import { LANDMARKS } from "./mapping";

export interface LandmarkExhibit {
  id: string;
  title: string;
  href: string;
}

export interface LandmarkView {
  /** Position of the model in the snapshot's columns. */
  index: number;
  model: string;
  exhibit?: LandmarkExhibit;
}

export interface ExhibitRef {
  id: string;
  title: string;
  eraId?: EraId;
}

/** The exhibit page link for an exhibit, or nothing when it is unknown or not placed in an era. */
export function exhibitLink(exhibit: ExhibitRef | undefined): LandmarkExhibit | undefined {
  if (!exhibit?.eraId) return undefined;
  return { id: exhibit.id, title: exhibit.title, href: `/rooms/${eraById(exhibit.eraId).slug}/${exhibit.id}` };
}

/**
 * Joins the hand-made landmark list to the snapshot and to the museum's exhibits. A landmark whose
 * model is missing from the snapshot is skipped, never matched to a similar name.
 */
export function landmarkViews(names: readonly string[], exhibits: readonly ExhibitRef[]): LandmarkView[] {
  const indexByName = new Map(names.map((name, index) => [name, index]));
  const exhibitById = new Map(exhibits.map((exhibit) => [exhibit.id, exhibit]));

  return LANDMARKS.flatMap((landmark): LandmarkView[] => {
    const index = indexByName.get(landmark.model);
    if (index === undefined) return [];
    const exhibit = exhibitLink(landmark.exhibitId ? exhibitById.get(landmark.exhibitId) : undefined);
    return [exhibit ? { index, model: landmark.model, exhibit } : { index, model: landmark.model }];
  });
}
