import { artefactFor } from "../src/museum/artefacts";
import { SafeLink } from "./SafeLink";

// The credit line for the object on this exhibit's plinth: what it is and what it was built from.
export function ArtefactCredit({ exhibitId }: { exhibitId: string }) {
  const artefact = artefactFor(exhibitId);
  if (!artefact) return null;
  return (
    <p className="artefact-credit">
      {artefact.kind === "replica" ? `Replica of ${artefact.credit} — modelled from ` : `${artefact.credit}. Entry: `}
      <SafeLink href={artefact.referenceUrl}>{artefact.referenceLabel}</SafeLink>.
    </p>
  );
}
