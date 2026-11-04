import { artefactFor, creditParts } from "../src/museum/artefacts";
import { SafeLink } from "./SafeLink";

// The object on this exhibit's plinth: what it is, what it was built from, and its sourced parts.
export function ArtefactCredit({ exhibitId }: { exhibitId: string }) {
  const artefact = artefactFor(exhibitId);
  if (!artefact) return null;
  const credit = creditParts(artefact);
  return (
    <section className="artefact" aria-label="Object on the plinth">
      <p className="artefact-credit">
        {credit.before}
        <SafeLink href={artefact.referenceUrl}>{credit.title}</SafeLink>
        {credit.after}
      </p>
      <ul className="artefact-hotspots">
        {artefact.hotspots.map((hotspot) => (
          <li key={hotspot.id}>
            <strong>{hotspot.label}.</strong> {hotspot.text} <SafeLink href={hotspot.sourceUrl}>Source</SafeLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
