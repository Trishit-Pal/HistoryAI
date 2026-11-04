"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import type { DialEntry } from "../../src/museum/dial";
import { hasWebGL, usePrefersReducedMotion } from "../../src/museum/env";
import { CreditLine } from "../ArtefactCredit";

// Client only; the stage keeps its fixed height while it loads, so nothing shifts.
const DialScene = dynamic(() => import("./DialScene").then((mod) => mod.DialScene), { ssr: false });

// The front artefact's own motion plays this long after the visitor touches the dial, then rests.
const PLAY_MS = 4000;

// The dial: a native range over the artefacts, oldest first (one step per artefact; the native
// arrow, Page and Home/End keys walk it). It turns the shelf in the canvas above it; without WebGL
// the dial, label and Visit link stay. `entries` must not be empty (Timeline leaves the dial out).
export function ArtefactDial({ entries }: { entries: DialEntry[] }) {
  const router = useRouter();
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setWebgl(hasWebGL());
    return () => clearTimeout(timer.current);
  }, []);

  // Motion only answers the visitor, and never under reduced motion.
  const play = useCallback(() => {
    if (reduced) return;
    setPlaying(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPlaying(false), PLAY_MS);
  }, [reduced]);

  const choose = (next: number) => {
    setIndex(next);
    play();
  };

  const entry = entries[index];
  const last = entries.length - 1;
  const kind = entry.artefact.kind === "data" ? "Published structure" : "Replica";

  return (
    <div className="dial">
      <div
        className="dial-stage"
        hidden={webgl === false}
        role="img"
        aria-label={`${kind}: ${entry.title} (${entry.year}), at the front of a ring of era artefacts.`}
        onPointerEnter={play}
      >
        {webgl ? (
          <DialScene
            entries={entries}
            index={index}
            reduced={reduced}
            playing={playing}
            onSelect={choose}
            onVisit={(i) => router.push(entries[i].href)}
          />
        ) : null}
      </div>
      <div className="dial-controls">
        <p className="dial-label">
          <span className="dial-year">{entry.year}</span> · {entry.title}
        </p>
        <div className="dial-track">
          <div className="dial-ticks" aria-hidden="true">
            {entries.map((e, i) => (
              <span key={e.id} className={i === index ? "is-current" : undefined} style={{ "--at": i / Math.max(1, last) } as CSSProperties} />
            ))}
          </div>
          <input
            className="dial-range"
            type="range"
            min={0}
            max={last}
            step={1}
            value={index}
            aria-label="Choose an era by year"
            aria-valuetext={`${entry.year}, ${entry.title}`}
            onChange={(event) => choose(Number(event.target.value))}
            onFocus={play}
          />
        </div>
        <Link className="dial-visit" href={entry.href} onPointerEnter={play} onFocus={play}>
          Visit {entry.title} <span aria-hidden="true">→</span>
        </Link>
        <div className="dial-credit">
          <CreditLine artefact={entry.artefact} />
        </div>
      </div>
    </div>
  );
}
