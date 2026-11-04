"use client";

import { eraById } from "../src/domain/eras";
import type { Hall } from "../src/domain/layout";
import { hallNeighbors } from "../src/domain/threads";
import { hallTally, tallyLabel } from "../src/domain/visited";
import { hallSpan } from "../src/museum/hallMath";
import type { MuseumNode } from "../src/museum/view";
import { ArtefactCredit } from "./ArtefactCredit";
import { FigureCredit } from "./FigureCredit";
import { HallOrderNav } from "./HallOrderNav";

function hallHeading(hall: Hall, emptyProvisional: boolean): string {
  const span = hallSpan(hall);
  const winter = hall.mood === "winter" ? " · winter" : "";
  const empty = emptyProvisional ? " · No provisional exhibits yet." : "";
  return `${hall.label}${span}${winter}${empty}`;
}

export function Flatland({
  halls,
  nodes,
  year,
  visited,
  focusedId,
  onFocus,
}: {
  halls: Hall[];
  nodes: MuseumNode[];
  year: number;
  visited: string[];
  focusedId: string | null;
  onFocus: (id: string) => void;
}) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  return (
    <div className="flatland">
      {halls.map((hall) => {
        const members = hall.exhibitIds.map((id) => byId.get(id)).filter(Boolean) as MuseumNode[];
        const emptyProvisional = hall.id === "provisional" && members.length === 0;
        const openedLabel = tallyLabel(hallTally(hall.exhibitIds, members, year, visited));
        return (
          <section key={hall.id}>
            <h2>{hallHeading(hall, emptyProvisional)}</h2>
            {openedLabel ? <p className="years">{openedLabel}</p> : null}
            {members.map((node) => {
              const ghost = node.startYear > year;
              const selected = node.id === focusedId;
              const neighbors = hallNeighbors(hall.exhibitIds, members, year, node.id);
              return (
                <article
                  key={node.id}
                  className={[selected ? "selected" : "", ghost ? "ghost" : ""].filter(Boolean).join(" ")}
                >
                  <button type="button" onClick={() => onFocus(node.id)} aria-current={selected ? "true" : undefined}>
                    <span className="exhibit-title">{node.title}</span>
                  </button>
                  <p className="years">
                    {node.startYear}
                    {node.endYear ? `–${node.endYear}` : ""}
                  </p>
                  <div className="badges">
                    <span className={`badge badge-${node.confidence ?? "unset"}`}>{node.confidence ?? "unset"}</span>
                  </div>
                  {ghost ? null : (
                    <HallOrderNav earlier={neighbors.earlier} later={neighbors.later} onFocus={onFocus} />
                  )}
                  <FigureCredit figure={node.figure} />
                  <ArtefactCredit exhibitId={node.id} />
                  <p>{node.publicStory}</p>
                  {node.eraId ? (
                    <p>
                      <a href={`/rooms/${eraById(node.eraId).slug}/${node.id}`}>Full exhibit, sources and changes</a>
                    </p>
                  ) : null}
                  {node.editorialNote ? <p className="note">{node.editorialNote}</p> : null}
                </article>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
