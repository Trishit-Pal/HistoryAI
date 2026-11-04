"use client";

import type { MuseumNode } from "../src/museum/view";
import { eraById } from "../src/domain/eras";
import { ArtefactCredit } from "./ArtefactCredit";
import { FigureCredit } from "./FigureCredit";
import { HallOrderNav } from "./HallOrderNav";
import { InspectArtefact } from "./InspectArtefact";
import { SafeLink } from "./SafeLink";

export function Dossier({
  node,
  hallLabel,
  openedLabel,
  earlier,
  later,
  onFocus,
  sheet,
  onHotspot,
  onInspect,
}: {
  node?: MuseumNode;
  hallLabel?: string;
  openedLabel?: string | null;
  earlier?: string;
  later?: string;
  onFocus: (id: string) => void;
  sheet?: { number: number; total: number };
  onHotspot?: (part: string | null) => void;
  onInspect?: (open: boolean) => void;
}) {
  if (!node) {
    return (
      <aside className="dossier plate">
        <p>Nothing provisional is on the floor yet.</p>
      </aside>
    );
  }
  return (
    <aside className="dossier plate">
      <dl className="titleblock">
        <div>
          <dt>Hall</dt>
          <dd>{hallLabel}</dd>
        </div>
        <div>
          <dt>Years</dt>
          <dd>
            {node.startYear}
            {node.endYear ? `–${node.endYear}` : ""}
          </dd>
        </div>
        <div>
          <dt>Kind</dt>
          <dd>
            {node.kind}, {node.layer}
          </dd>
        </div>
        <div>
          <dt>Confidence</dt>
          <dd className="badges">
            <span className={`badge badge-${node.confidence ?? "unset"}`}>{node.confidence ?? "unset"}</span>
            {node.incomplete ? <span className="badge">incomplete</span> : null}
          </dd>
        </div>
        {sheet ? (
          <div>
            <dt>Sheet</dt>
            <dd>
              {sheet.number} of {sheet.total}
            </dd>
          </div>
        ) : null}
      </dl>
      {openedLabel ? <p className="years">{openedLabel}</p> : null}
      <h1>{node.title}</h1>
      <FigureCredit figure={node.figure} />
      <ArtefactCredit exhibitId={node.id} onHotspot={onHotspot} />
      <InspectArtefact key={node.id} exhibitId={node.id} title={node.title} onOpenChange={onInspect} />
      <HallOrderNav earlier={earlier} later={later} onFocus={onFocus} />
      <p>{node.publicStory}</p>
      {node.editorialNote ? <p className="note">{node.editorialNote}</p> : null}
      {node.technicalAccount ? (
        <section>
          <h2>Technical account</h2>
          <p>{node.technicalAccount}</p>
        </section>
      ) : null}
      <section>
        <h2>Sources</h2>
        <ul>
          {node.citations.map((citation) => (
            <li key={citation.url}>
              <SafeLink href={citation.url}>{citation.publisher}</SafeLink>
            </li>
          ))}
        </ul>
      </section>
      {node.eraId ? (
        <p>
          <a href={`/rooms/${eraById(node.eraId).slug}/${node.id}`}>Full exhibit, sources and changes</a>
        </p>
      ) : null}
    </aside>
  );
}
