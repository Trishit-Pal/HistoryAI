"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type CSSProperties, type KeyboardEvent, useEffect, useState } from "react";
import { type DialEntry, nearestIndex } from "../../src/museum/dial";
import { hasWebGL, usePrefersReducedMotion } from "../../src/museum/env";
import { CreditLine } from "../ArtefactCredit";

// Client only; the stage keeps its fixed height while it loads, so nothing shifts.
const DialScene = dynamic(() => import("./DialScene").then((mod) => mod.DialScene), { ssr: false });

const STEP_KEYS: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, PageUp: 1, ArrowLeft: -1, ArrowDown: -1, PageDown: -1 };

// The year dial: a native range whose value snaps to the exhibit years that have an artefact.
// It turns the shelf in the canvas above it; without WebGL the dial, label and Visit link stay.
// `entries` must not be empty (Timeline leaves the dial out when no shown exhibit has an artefact).
export function ArtefactDial({ entries }: { entries: DialEntry[] }) {
  const router = useRouter();
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [webgl, setWebgl] = useState<boolean | null>(null);

  useEffect(() => {
    setWebgl(hasWebGL());
  }, []);

  const entry = entries[index];
  const first = entries[0].year;
  const last = entries[entries.length - 1].year;
  const kind = entry.artefact.kind === "data" ? "Published structure" : "Replica";

  // Arrow keys step artefact to artefact, not year to year.
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const end = event.key === "Home" ? 0 : event.key === "End" ? entries.length - 1 : null;
    const delta = STEP_KEYS[event.key];
    if (end === null && delta === undefined) return;
    event.preventDefault();
    setIndex(end ?? Math.min(entries.length - 1, Math.max(0, index + delta)));
  };

  return (
    <div className="dial">
      <div
        className="dial-stage"
        hidden={webgl === false}
        role="img"
        aria-label={`${kind} of the artefact for ${entry.title} (${entry.year}), standing at the front of a ring of era artefacts.`}
      >
        {webgl ? (
          <DialScene
            entries={entries}
            index={index}
            reduced={reduced}
            onSelect={setIndex}
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
              <span
                key={e.id}
                className={i === index ? "is-current" : undefined}
                style={{ "--at": (e.year - first) / Math.max(1, last - first) } as CSSProperties}
              />
            ))}
          </div>
          <input
            className="dial-range"
            type="range"
            min={first}
            max={last}
            step={1}
            value={entry.year}
            aria-label="Choose an era by year"
            aria-valuetext={`${entry.year}, ${entry.title}`}
            onChange={(event) => setIndex(nearestIndex(entries, Number(event.target.value)))}
            onKeyDown={onKeyDown}
          />
        </div>
        <div className="dial-ends" aria-hidden="true">
          <span>{first}</span>
          <span>{last}</span>
        </div>
        <Link className="dial-visit" href={entry.href}>
          Visit {entry.title} <span aria-hidden="true">→</span>
        </Link>
        <div className="dial-credit">
          <CreditLine artefact={entry.artefact} />
        </div>
      </div>
    </div>
  );
}
