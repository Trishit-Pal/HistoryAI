"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { eraById } from "../../src/domain/eras";
import type { MuseumNode } from "../../src/museum/view";
import { FieldChangeSection } from "../FieldChangeSection";
import { SafeLink } from "../SafeLink";

export function ReadingModal({ node, onClose }: { node: MuseumNode; onClose: () => void }) {
  const sheet = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const slug = node.eraId ? eraById(node.eraId).slug : undefined;

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    close.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !sheet.current) return;
      const items = [...sheet.current.querySelectorAll<HTMLElement>("a[href], button")];
      const first = items[0];
      const last = items.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [onClose]);

  return (
    <div className="night-modal" onClick={onClose}>
      <div
        ref={sheet}
        className="night-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="night-title"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="night-year">{node.startYear}</p>
        <h2 id="night-title">{node.title}</h2>
        <p>{node.publicStory}</p>
        <FieldChangeSection fieldChange={node.fieldChange} claims={[]} />
        <h2>Sources</h2>
        <ul>
          {node.citations.map((citation) => (
            <li key={citation.url}>
              <SafeLink href={citation.url}>{citation.publisher}</SafeLink>
            </li>
          ))}
        </ul>
        {slug ? <Link href={`/rooms/${slug}/${node.id}`}>Full exhibit</Link> : null}
        <button ref={close} type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
