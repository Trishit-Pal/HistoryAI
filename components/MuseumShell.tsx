"use client";

import { useEffect, useRef, useState } from "react";
import { ERAS } from "../src/domain/eras";
import type { Hall } from "../src/domain/layout";
import { hallNeighbors } from "../src/domain/threads";
import { hallTally, parseVisited, tallyLabel } from "../src/domain/visited";
import { hasWebGL, usePrefersReducedMotion } from "../src/museum/env";
import { enterHall, focusExhibit, type NavState } from "../src/museum/seal";
import { chooseView, type MuseumNode } from "../src/museum/view";
import { HallCorridor } from "./HallCorridor";
import { Flatland } from "./Flatland";
import { Breadcrumbs } from "./Breadcrumbs";
import { Dossier } from "./Dossier";
import { EXHIBIT_PANEL_ID, ExhibitTabs, exhibitTabId } from "./ExhibitTabs";

const VISITED_KEY = "historyai.visited";
// No cutoff: nothing is sealed or ghosted. Only ever compared, never printed or serialized.
const YEAR = Number.POSITIVE_INFINITY;

export function MuseumShell({
  nodes,
  halls,
  initialHallId,
  archivedAt,
}: {
  nodes: MuseumNode[];
  halls: Hall[];
  initialHallId?: string;
  archivedAt?: string;
}) {
  const startIndex = Math.max(0, halls.findIndex((hall) => hall.id === initialHallId));
  const startHall = halls[startIndex] ?? halls[0];
  // null until the browser has been asked: the 3D canvas must not be attempted without WebGL.
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const reduced = usePrefersReducedMotion();
  const year = YEAR;
  const [nav, setNav] = useState<NavState>({
    focusedId: startHall?.exhibitIds[0] ?? nodes[0]?.id ?? null,
    hallIndex: startIndex,
  });
  const [visited, setVisited] = useState<string[]>([]);
  const [visitedReady, setVisitedReady] = useState(false);
  const { focusedId, hallIndex } = nav;

  useEffect(() => {
    setWebgl(hasWebGL());
  }, []);

  useEffect(() => {
    setVisited(parseVisited(sessionStorage.getItem(VISITED_KEY)));
    setVisitedReady(true);
  }, []);

  useEffect(() => {
    if (!visitedReady || !focusedId) return;
    setVisited((prev) => (prev.includes(focusedId) ? prev : [...prev, focusedId]));
  }, [focusedId, visitedReady]);

  useEffect(() => {
    if (!visitedReady) return;
    sessionStorage.setItem(VISITED_KEY, JSON.stringify(visited));
  }, [visited, visitedReady]);

  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    if (!id) return;
    const node = nodes.find((item) => item.id === id);
    if (!node) return;
    const index = halls.findIndex((hall) => hall.exhibitIds.includes(node.id));
    setNav((prev) => ({ focusedId: node.id, hallIndex: index >= 0 ? index : prev.hallIndex }));
  }, [halls, nodes]);

  const view = chooseView({ webgl: webgl !== false, reducedMotion: reduced });
  const focused = nodes.find((node) => node.id === focusedId) ?? nodes[0];
  const focusedHall =
    halls.find((hall) => focused && hall.exhibitIds.includes(focused.id)) ?? halls[hallIndex] ?? halls[0];
  const hallExhibits = (focusedHall?.exhibitIds ?? [])
    .map((id) => nodes.find((node) => node.id === id))
    .filter((node): node is MuseumNode => node !== undefined);
  const neighbors = hallNeighbors(focusedHall?.exhibitIds ?? [], nodes, year, focused?.id ?? null);
  const previousHall = halls[hallIndex - 1];
  const nextHall = halls[hallIndex + 1];
  const openedLabel = focusedHall
    ? tallyLabel(hallTally(focusedHall.exhibitIds, nodes, year, visited))
    : null;

  // Keep /rooms/<slug> in step with the hall. Native replaceState syncs Next's router without
  // re-rendering the route (so the 3D shell stays mounted). The first hall keeps its #id hash.
  const hallId = focusedHall?.id;
  const shownHallId = useRef(hallId);
  useEffect(() => {
    if (!hallId || hallId === shownHallId.current) return;
    shownHallId.current = hallId;
    const era = ERAS.find((item) => item.id === hallId);
    if (era) window.history.replaceState(null, "", `/rooms/${era.slug}`);
  }, [hallId]);

  function onFocusExhibit(id: string) {
    setNav((prev) => focusExhibit(prev, id, { halls, nodes, year }));
  }

  function goHall(index: number) {
    setNav((prev) => enterHall(prev, index, { halls, nodes, year }));
  }

  return (
    <main className="shell">
      {archivedAt ? <p className="archive-banner">Showing the archived copy from {archivedAt}.</p> : null}
      <header className="rail">
        <Breadcrumbs
          items={[{ label: "Timeline", href: "/" }, { label: focusedHall?.label ?? "Hall of Eras" }]}
        />
        <div className="era-step">
          {previousHall ? (
            <button type="button" aria-label={`Previous era: ${previousHall.label}`} onClick={() => goHall(hallIndex - 1)}>
              {"◀ "}
              {previousHall.label}
            </button>
          ) : null}
          {nextHall ? (
            <button type="button" aria-label={`Next era: ${nextHall.label}`} onClick={() => goHall(hallIndex + 1)}>
              {nextHall.label}
              {" ▶"}
            </button>
          ) : null}
        </div>
      </header>
      <p className="sr-only" role="status">
        {focused && focusedHall ? `Showing ${focused.title}, ${focused.confidence ?? "unset"}, in ${focusedHall.label}.` : ""}
      </p>
      <div className="stage">
        {view === "halls" ? (
          <div className="viewport">
            <div className="canvas-wrap">
              {webgl ? (
                <HallCorridor
                  halls={halls}
                  nodes={nodes}
                  year={year}
                  hallIndex={hallIndex}
                  focusedId={focused?.id ?? null}
                  reducedMotion={reduced}
                  onFocus={onFocusExhibit}
                  onHall={goHall}
                />
              ) : null}
            </div>
            <ExhibitTabs exhibits={hallExhibits} year={year} focusedId={focused?.id ?? null} onFocus={onFocusExhibit} />
          </div>
        ) : (
          <Flatland
            halls={halls}
            nodes={nodes}
            year={year}
            visited={visited}
            focusedId={focused?.id ?? null}
            onFocus={onFocusExhibit}
          />
        )}
        <div
          className="dossier-panel"
          {...(view === "halls" && focused
            ? { id: EXHIBIT_PANEL_ID, role: "tabpanel", "aria-labelledby": exhibitTabId(focused.id) }
            : {})}
        >
          <Dossier
            node={focused}
            hallLabel={focusedHall?.label}
            openedLabel={openedLabel}
            earlier={neighbors.earlier}
            later={neighbors.later}
            onFocus={onFocusExhibit}
            sheet={focusedHall ? { number: halls.indexOf(focusedHall) + 1, total: halls.length } : undefined}
          />
        </div>
      </div>
    </main>
  );
}
