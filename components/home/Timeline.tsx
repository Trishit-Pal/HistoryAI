"use client";

import Link from "next/link";
import { useState } from "react";
import { ERAS } from "../../src/domain/eras";
import type { Hall } from "../../src/domain/layout";
import { CONFIDENCE_GLYPH } from "../../src/museum/theme";
import type { MuseumNode } from "../../src/museum/view";
import { YearRail, type RailEntry } from "./YearRail";

// ponytail: the provisional hall has no room of its own; the hash focus in MuseumShell finds it from any room.
const FALLBACK_SLUG = "frontier";

type Band = { hall: Hall; key: string; slug: string | null; year: string; span: string; exhibits: MuseumNode[] };

function bandsFrom(halls: Hall[], nodes: MuseumNode[]): Band[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  return halls.map((hall) => {
    const slug = ERAS.find((era) => era.id === hall.id)?.slug ?? null;
    const start = hall.startYear === null ? "" : String(hall.startYear);
    return {
      hall,
      key: slug ?? hall.id,
      slug,
      year: start || "New",
      span: start ? `${start} – ${hall.endYear ?? "today"}` : "Awaiting review",
      exhibits: hall.exhibitIds.map((id) => byId.get(id)).filter((node): node is MuseumNode => node !== undefined),
    };
  });
}

export function Timeline({ nodes, halls, archivedAt }: { nodes: MuseumNode[]; halls: Hall[]; archivedAt?: string }) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const bands = bandsFrom(halls, nodes);
  const matches = (node: MuseumNode) => !needle || node.title.toLowerCase().includes(needle);
  const total = bands.reduce((sum, band) => sum + band.exhibits.filter(matches).length, 0);
  // While searching, an era with no matching exhibit leaves both the timeline and the rail.
  const hiddenKeys = new Set(needle ? bands.filter((band) => !band.exhibits.some(matches)).map((band) => band.key) : []);
  const rail: RailEntry[] = bands.map((band) => ({
    id: `era-${band.key}`,
    year: band.year,
    label: band.hall.label,
    hidden: hiddenKeys.has(band.key),
  }));

  return (
    <div className="night">
      {archivedAt ? <p className="archive-banner">Showing the archived copy from {archivedAt}.</p> : null}
      <header className="tl-hero">
        <h1>Hall of Eras</h1>
        <p>A sourced walk through the history of artificial intelligence, one era at a time.</p>
      </header>
      <div className="tl-layout">
        <div className="tl-main">
          <div className="tl-search">
            <label htmlFor="tl-search-input">Search exhibits</label>
            <input
              id="tl-search-input"
              type="search"
              value={query}
              placeholder="Dartmouth, perceptron, transformer…"
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <p className="tl-empty" role="status">
            {needle && total === 0 ? `No exhibits match “${query.trim()}”.` : null}
          </p>
          <ol className="tl-bands">
            {bands.map((band) => {
              const shown = band.exhibits.filter(matches);
              const muted = band.exhibits.length === 0;
              const headingId = `era-${band.key}-title`;
              return (
                <li key={band.key} hidden={hiddenKeys.has(band.key)}>
                  <section id={`era-${band.key}`} className={muted ? "tl-band is-muted" : "tl-band"} aria-labelledby={headingId}>
                    <div className="tl-year" aria-hidden="true">
                      {band.year}
                    </div>
                    <div className="tl-body">
                      <h2 id={headingId}>{band.hall.label}</h2>
                      {band.hall.summary ? <p className="tl-summary">{band.hall.summary}</p> : null}
                      <p className="tl-span">
                        {band.span}
                        {band.exhibits.length > 0 ? ` · ${band.exhibits.length} exhibit${band.exhibits.length === 1 ? "" : "s"}` : " · sealed"}
                        {band.slug ? (
                          <Link className="tl-enter" href={`/rooms/${band.slug}`}>
                            Enter the hall <span aria-hidden="true">→</span>
                          </Link>
                        ) : null}
                      </p>
                      {shown.length > 0 ? (
                        <ul className="tl-cards">
                          {shown.map((node) => (
                            <li key={node.id}>
                              <ExhibitCard node={node} href={`/rooms/${band.slug ?? FALLBACK_SLUG}#${node.id}`} />
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </section>
                </li>
              );
            })}
          </ol>
        </div>
        <YearRail entries={rail} />
      </div>
    </div>
  );
}

function ExhibitCard({ node, href }: { node: MuseumNode; href: string }) {
  const confidence = node.confidence ?? "unset";
  const word = node.confidence ?? "unrated";
  return (
    <Link className="tl-card" href={href}>
      <span className="tl-card-year">{node.startYear}</span>
      <span className="tl-card-title" title={node.title}>
        {node.title}
      </span>
      <span className={`tl-card-conf tl-conf-${confidence}`}>
        <span aria-hidden="true">{CONFIDENCE_GLYPH[confidence]}</span> {word}
      </span>
    </Link>
  );
}
