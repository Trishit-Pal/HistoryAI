"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import type { Hall } from "../src/domain/layout";
import type { ChangelogLine } from "../src/store/memory";
import { hallNeighbors } from "../src/domain/threads";
import { hallTally, parseVisited, tallyLabel } from "../src/domain/visited";
import { askMuseum, chooseView, type MuseumAnswer, type MuseumNode } from "../src/museum/view";
import { HallCorridor } from "./HallCorridor";
import { Flatland } from "./Flatland";
import { Dossier } from "./Dossier";

const VISITED_KEY = "historyai.visited";

function hasWebGL(): boolean {
  if (typeof document === "undefined") return false;
  const canvas = document.createElement("canvas");
  return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
}

function hallSpan(hall: Hall): string {
  if (!hall.startYear) return "";
  return ` ${hall.startYear}${hall.endYear ? `–${hall.endYear}` : "–"}`;
}

export function MuseumShell({
  nodes,
  halls,
}: {
  nodes: MuseumNode[];
  halls: Hall[];
  changelog: ChangelogLine[];
}) {
  const [webgl, setWebgl] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [year, setYear] = useState(2026);
  const [hallIndex, setHallIndex] = useState(0);
  const [focusedId, setFocusedId] = useState<string | null>(nodes[0]?.id ?? null);
  const [ask, setAsk] = useState("");
  const [answer, setAnswer] = useState<MuseumAnswer | null>(null);
  const [visited, setVisited] = useState<string[]>([]);
  const [visitedReady, setVisitedReady] = useState(false);

  useLayoutEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    setWebgl(hasWebGL());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
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
    setFocusedId(node.id);
    const index = halls.findIndex((hall) => hall.exhibitIds.includes(node.id));
    if (index >= 0) setHallIndex(index);
  }, [halls, nodes]);

  const view = chooseView({ webgl, reducedMotion: reduced });
  const focused = nodes.find((node) => node.id === focusedId) ?? nodes[0];
  const focusedHall =
    halls.find((hall) => focused && hall.exhibitIds.includes(focused.id)) ?? halls[hallIndex] ?? halls[0];
  const neighbors = hallNeighbors(focusedHall?.exhibitIds ?? [], nodes, year, focused?.id ?? null);
  const openedLabel = focusedHall
    ? tallyLabel(hallTally(focusedHall.exhibitIds, nodes, year, visited))
    : null;

  function sealed(hall: Hall): boolean {
    if (hall.id === "provisional") return year < 2023;
    const members = hall.exhibitIds
      .map((id) => nodes.find((node) => node.id === id))
      .filter((node): node is MuseumNode => Boolean(node));
    return members.length > 0 && members.every((node) => node.startYear > year);
  }

  function focusExhibit(id: string) {
    setFocusedId(id);
    const index = halls.findIndex((hall) => hall.exhibitIds.includes(id));
    if (index >= 0 && halls[index] && !sealed(halls[index])) setHallIndex(index);
  }

  function goHall(index: number) {
    const next = Math.max(0, Math.min(halls.length - 1, index));
    const hall = halls[next];
    if (!hall || sealed(hall)) return;
    setHallIndex(next);
    const first = hall.exhibitIds.find((id) => {
      const node = nodes.find((item) => item.id === id);
      return node && node.startYear <= year;
    });
    if (first) setFocusedId(first);
  }

  useEffect(() => {
    const current = nodes.find((node) => node.id === focusedId);
    if (current && current.startYear > year) {
      const inYear = nodes.filter((node) => node.startYear <= year);
      if (inYear.length === 0) return;
      const nearest = inYear.reduce((best, node) =>
        Math.abs(node.startYear - year) < Math.abs(best.startYear - year) ? node : best,
      );
      setFocusedId(nearest.id);
      const index = halls.findIndex((hall) => hall.exhibitIds.includes(nearest.id));
      if (index >= 0 && halls[index] && !sealed(halls[index])) setHallIndex(index);
      return;
    }
    const hall = halls[hallIndex];
    if (hall && sealed(hall)) {
      for (let i = hallIndex - 1; i >= 0; i -= 1) {
        if (halls[i] && !sealed(halls[i])) {
          goHall(i);
          break;
        }
      }
    }
  }, [year]);

  return (
    <main className="shell">
      <header className="rail">
        <p className="site-name">Hall of Eras</p>
        <label htmlFor="year">Show work up to {year}</label>
        <input
          id="year"
          type="range"
          min={1843}
          max={2026}
          value={year}
          onChange={(event) => setYear(Number(event.target.value))}
        />
        <div className="index" role="navigation" aria-label="Halls">
          {halls.map((hall, index) => (
            <button
              key={hall.id}
              type="button"
              aria-current={index === hallIndex ? "true" : undefined}
              disabled={sealed(hall)}
              onClick={() => goHall(index)}
            >
              {hall.label}
              {hallSpan(hall)}
            </button>
          ))}
        </div>
      </header>
      <div className="stage">
        {view === "halls" ? (
          <div className="canvas-wrap">
            <HallCorridor
              halls={halls}
              nodes={nodes}
              year={year}
              hallIndex={hallIndex}
              focusedId={focused?.id ?? null}
              reducedMotion={reduced}
              onFocus={focusExhibit}
              onHall={goHall}
            />
          </div>
        ) : (
          <Flatland
            halls={halls}
            nodes={nodes}
            year={year}
            visited={visited}
            focusedId={focused?.id ?? null}
            onFocus={focusExhibit}
          />
        )}
        <Dossier
          node={focused}
          ask={ask}
          answer={answer}
          onAskChange={setAsk}
          onAsk={() => {
            const result = askMuseum(ask, nodes);
            setAnswer(result);
            if (result.id) focusExhibit(result.id);
          }}
          hallLabel={focusedHall?.label}
          openedLabel={openedLabel}
          earlier={neighbors.earlier}
          later={neighbors.later}
          onFocus={focusExhibit}
        />
      </div>
    </main>
  );
}
