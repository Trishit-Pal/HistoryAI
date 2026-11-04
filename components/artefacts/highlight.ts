import { createContext } from "react";

// The part of one exhibit's artefact the visitor is pointing at in the Dossier's hotspot list.
// Provided inside the corridor Canvas, so the rooms need not pass it down.
export type PartHighlight = { exhibitId: string; part: string } | null;

export const HighlightContext = createContext<PartHighlight>(null);
