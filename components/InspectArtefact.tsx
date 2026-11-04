"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { artefactFor } from "../src/museum/artefacts";
import { hasWebGL, usePrefersReducedMotion } from "../src/museum/env";
import { CreditLine } from "./ArtefactCredit";
import { SafeLink } from "./SafeLink";

const InspectScene = dynamic(() => import("./artefacts/InspectScene").then((mod) => mod.InspectScene), {
  ssr: false,
  loading: () => (
    <p className="inspect-loading" role="status">
      Loading the 3D view…
    </p>
  ),
});

// "Inspect the artefact": a native modal dialog (its own focus trap, Esc to close) with the
// object on a turntable and its sourced parts as buttons. Without WebGL there is no button:
// the same parts and sources are already listed beside it.
export function InspectArtefact({
  exhibitId,
  title,
  onOpenChange,
}: {
  exhibitId: string;
  title: string;
  onOpenChange?: (open: boolean) => void;
}) {
  const artefact = artefactFor(exhibitId);
  const reduced = usePrefersReducedMotion();
  const [webgl, setWebgl] = useState(false);
  const [open, setOpen] = useState(false);
  const [part, setPart] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setWebgl(hasWebGL());
  }, []);

  // If this unmounts while open (the exhibit changes under it), never leave the corridor paused.
  const latest = useRef(onOpenChange);
  const isOpen = useRef(false);
  useEffect(() => {
    latest.current = onOpenChange;
    isOpen.current = open;
  });
  useEffect(
    () => () => {
      if (isOpen.current) latest.current?.(false);
    },
    [],
  );

  if (!artefact || !webgl) return null;
  const titleId = `inspect-title-${exhibitId}`;
  const selected = artefact.hotspots.find((hotspot) => hotspot.id === part);

  const show = () => {
    setPart(null);
    setOpen(true);
    onOpenChange?.(true);
    dialog.current?.showModal();
  };
  const closed = () => {
    setOpen(false);
    onOpenChange?.(false);
    opener.current?.focus();
  };

  return (
    <>
      <button ref={opener} type="button" className="inspect-open" onClick={show}>
        Inspect the artefact
      </button>
      <dialog ref={dialog} className="inspect" aria-labelledby={titleId} onClose={closed}>
        <header className="inspect-head">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="inspect-close" onClick={() => dialog.current?.close()}>
            Close
          </button>
        </header>
        <div className="inspect-body">
          <div className="inspect-canvas" role="img" aria-label={`The object for ${title}, on a turntable. Drag to turn it; scroll or pinch to zoom.`}>
            {open ? <InspectScene artefact={artefact} highlight={part ?? undefined} reduced={reduced} /> : null}
          </div>
          <div className="inspect-side">
            <CreditLine artefact={artefact} />
            <h3>Parts</h3>
            <ul className="inspect-parts">
              {artefact.hotspots.map((hotspot) => (
                <li key={hotspot.id}>
                  <button
                    type="button"
                    aria-pressed={part === hotspot.id}
                    onClick={() => setPart((current) => (current === hotspot.id ? null : hotspot.id))}
                  >
                    {hotspot.label}
                  </button>
                </li>
              ))}
            </ul>
            <p className="inspect-text" aria-live="polite">
              {selected ? (
                <>
                  {selected.text} <SafeLink href={selected.sourceUrl}>Source</SafeLink>
                </>
              ) : (
                "Choose a part to light it in gold and read its source."
              )}
            </p>
          </div>
        </div>
      </dialog>
    </>
  );
}
