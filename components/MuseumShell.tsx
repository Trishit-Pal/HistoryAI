"use client";

import { useEffect, useState } from "react";
import type { Hall } from "../src/domain/layout";
import { hallNeighbors } from "../src/domain/threads";
import { hallTally, parseVisited, tallyLabel } from "../src/domain/visited";
import { hasWebGL, usePrefersReducedMotion } from "../src/museum/env";
import { hallSpan } from "../src/museum/hallMath";
import { enterHall, focusExhibit, isSealed, reconcileFocus, type NavState } from "../src/museum/seal";
import { chooseView, type MuseumNode } from "../src/museum/view";
import { HallCorridor } from "./HallCorridor";
import { Flatland } from "./Flatland";
import { Dossier } from "./Dossier";
import { EXHIBIT_PANEL_ID, ExhibitTabs, exhibitTabId } from "./ExhibitTabs";
import { YearScale } from "./YearScale";

const VISITED_KEY = "historyai.visited";

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
  const [year, setYear] = useState(2026);
  const [plan, setPlan] = useState(false);
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
  const openedLabel = focusedHall
    ? tallyLabel(hallTally(focusedHall.exhibitIds, nodes, year, visited))
    : null;

  function onYear(next: number) {
    setYear(next);
    setNav((prev) => reconcileFocus(prev, { halls, nodes, year: next }));
  }

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
        <p className="site-name">Hall of Eras</p>
        <label htmlFor="year">Show work up to {year}</label>
        <YearScale year={year} onYear={onYear} />
        <div className="index" role="navigation" aria-label="Halls">
          {halls.map((hall, index) => (
            <button
              key={hall.id}
              type="button"
              aria-current={index === hallIndex ? "true" : undefined}
              disabled={isSealed(hall, nodes, year)}
              onClick={() => goHall(index)}
            >
              {hall.label}
              {hallSpan(hall)}
            </button>
          ))}
        </div>
        {webgl !== false ? (
          <button
            type="button"
            className="plan-toggle"
            aria-pressed={plan}
            // Holds its place in the rail while WebGL is checked, so nothing shifts when it appears.
            style={webgl ? undefined : { visibility: "hidden" }}
            onClick={() => setPlan((on) => !on)}
          >
            Plan view
          </button>
        ) : null}
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
                  plan={plan}
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
