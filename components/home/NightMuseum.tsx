"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ERAS, eraById } from "../../src/domain/eras";
import type { Hall } from "../../src/domain/layout";
import type { EraId } from "../../src/domain/types";
import { hasWebGL } from "../../src/museum/env";
import { chooseView } from "../../src/museum/view";
import type { MuseumNode } from "../../src/museum/view";
import { ReadingModal } from "./ReadingModal";

const HeroCloud = dynamic(() => import("./HeroCloud").then((mod) => mod.HeroCloud), { ssr: false });
const ScrollHall = dynamic(() => import("./ScrollHall").then((mod) => mod.ScrollHall), { ssr: false });

function hallNode(hall: Hall, nodes: MuseumNode[]): MuseumNode | undefined {
  return nodes.find((node) => node.id === hall.exhibitIds[0]);
}

function hallHref(id: string): string | null {
  if (!ERAS.some((era) => era.id === id)) return null;
  return `/rooms/${eraById(id as EraId).slug}`;
}

export function NightMuseum({
  nodes,
  halls,
  archivedAt,
}: {
  nodes: MuseumNode[];
  halls: Hall[];
  archivedAt?: string;
}) {
  const [webgl, setWebgl] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = nodes.find((node) => node.id === openId);
  const showHall = chooseView({ webgl, reducedMotion: reduced }) === "halls";

  useEffect(() => {
    setWebgl(hasWebGL());
    setReduced(
      typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  return (
    <div className="night">
      {archivedAt ? <p className="archive-banner">Showing the archived copy from {archivedAt}.</p> : null}
      <section className="night-hero">
        <div className="night-hero-copy">
          <h1>Hall of Eras</h1>
          <p>A sourced walk through the history of artificial intelligence.</p>
        </div>
        {showHall ? <HeroCloud count={nodes.length} reduced={reduced} /> : <div className="night-ring" aria-hidden="true" />}
      </section>
      <section className="night-block">
        <h2>Timeline</h2>
        <div className="night-timeline">
          {halls.filter((hall) => hall.exhibitIds.length > 0).map((hall) => {
            const node = hallNode(hall, nodes);
            const span = hall.startYear ? `${hall.startYear}${hall.endYear ? `–${hall.endYear}` : "–"}` : "";
            const href = hallHref(hall.id);
            return (
              <article key={hall.id} className="night-card">
                <button type="button" onClick={() => node && setOpenId(node.id)}>
                  <span className="night-year">{span}</span>
                  <strong>{hall.label}</strong>
                  {node ? <p>{node.publicStory}</p> : null}
                </button>
                {href ? <Link href={href}>Enter the hall</Link> : null}
              </article>
            );
          })}
        </div>
      </section>
      {showHall ? (
        <ScrollHall nodes={nodes} reduced={reduced} onOpen={setOpenId} />
      ) : (
        <section className="night-block">
          <h2>Hall</h2>
          <div className="night-ring" aria-hidden="true" />
        </section>
      )}
      <section className="night-block">
        <h2>Vault</h2>
        <ul className="night-vault">
          {nodes.map((node) => (
            <li key={node.id}>
              <button type="button" onClick={() => setOpenId(node.id)}>
                <span className="night-year">{node.startYear}</span>
                <strong>{node.title}</strong>
                {node.confidence ? <span>{node.confidence}</span> : null}
                {node.citations[0] ? <span>{node.citations[0].publisher}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      </section>
      {open ? <ReadingModal node={open} onClose={() => setOpenId(null)} /> : null}
    </div>
  );
}
