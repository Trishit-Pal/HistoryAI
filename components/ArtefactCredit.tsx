"use client";

import { useRef } from "react";
import { type Artefact, artefactFor, creditParts } from "../src/museum/artefacts";
import { SafeLink } from "./SafeLink";

export function CreditLine({ artefact }: { artefact: Artefact }) {
  const credit = creditParts(artefact);
  return (
    <p className="artefact-credit">
      {credit.before}
      <SafeLink href={artefact.referenceUrl}>{credit.title}</SafeLink>
      {credit.after}
    </p>
  );
}

// The object on this exhibit's plinth: what it is, what it was built from, and its sourced parts.
// onHotspot (the Dossier) lights the named part on the in-room artefact while an item is hovered or focused.
export function ArtefactCredit({
  exhibitId,
  onHotspot,
}: {
  exhibitId: string;
  onHotspot?: (part: string | null) => void;
}) {
  // The part this list last lit: leaving an item clears only if it is still the lit one, so the
  // mouse leaving item A never blanks item B that the keyboard has since focused (and vice versa).
  const lit = useRef<string | null>(null);
  const artefact = artefactFor(exhibitId);
  if (!artefact) return null;
  const light = (part: string) => {
    lit.current = part;
    onHotspot?.(part);
  };
  const clear = (part: string) => {
    if (lit.current !== part) return;
    lit.current = null;
    onHotspot?.(null);
  };
  return (
    <section className="artefact" aria-label="Object on the plinth">
      <CreditLine artefact={artefact} />
      <ul className="artefact-hotspots">
        {artefact.hotspots.map((hotspot) => (
          <li
            key={hotspot.id}
            onMouseEnter={() => light(hotspot.id)}
            onMouseLeave={() => clear(hotspot.id)}
            onFocus={() => light(hotspot.id)}
            onBlur={() => clear(hotspot.id)}
          >
            <strong>{hotspot.label}.</strong> {hotspot.text} <SafeLink href={hotspot.sourceUrl}>Source</SafeLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
