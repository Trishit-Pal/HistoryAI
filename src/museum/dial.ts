import { artefactFor, type Artefact } from "./artefacts";

// One stop on the home dial: a shown exhibit that has an artefact on its plinth.
export type DialEntry = { id: string; year: number; title: string; href: string; artefact: Artefact };

type Exhibit = { id: string; title: string; startYear: number };

// Oldest first; exhibits without an artefact are not on the dial.
export function dialEntries(groups: { href: (id: string) => string; exhibits: Exhibit[] }[]): DialEntry[] {
  return groups
    .flatMap((group) =>
      group.exhibits.flatMap((node) => {
        const artefact = artefactFor(node.id);
        return artefact ? [{ id: node.id, year: node.startYear, title: node.title, href: group.href(node.id), artefact }] : [];
      }),
    )
    .sort((a, b) => a.year - b.year);
}

// The stop whose year is closest to `year` (the earlier one on a tie).
export function nearestIndex(entries: DialEntry[], year: number): number {
  let best = 0;
  entries.forEach((entry, i) => {
    if (Math.abs(entry.year - year) < Math.abs(entries[best].year - year)) best = i;
  });
  return best;
}
