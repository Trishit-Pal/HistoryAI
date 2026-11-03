"use client";

import type { KeyboardEvent } from "react";
import type { MuseumNode } from "../src/museum/view";

// The Dossier panel the tabs control (MuseumShell gives it this id).
export const EXHIBIT_PANEL_ID = "exhibit-panel";

export function exhibitTabId(id: string): string {
  return `exhibit-tab-${id}`;
}

// The hall's exhibits as a row of tabs: the keyboard and screen-reader route to every
// monument in the 3D scene. The Dossier is the panel the selected tab controls.
export function ExhibitTabs({
  exhibits,
  year,
  focusedId,
  onFocus,
}: {
  exhibits: MuseumNode[];
  year: number;
  focusedId: string | null;
  onFocus: (id: string) => void;
}) {
  if (exhibits.length === 0) return null;
  const selectedId = exhibits.some((node) => node.id === focusedId) ? focusedId : exhibits[0]?.id;

  function move(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const last = exhibits.length - 1;
    const pressedOn = event.target instanceof Element ? event.target.closest("[role='tab']")?.id : undefined;
    const found = exhibits.findIndex((node) => exhibitTabId(node.id) === pressedOn);
    const current = found >= 0 ? found : exhibits.findIndex((node) => node.id === selectedId);
    const target: Record<string, number> = {
      ArrowRight: current >= last ? 0 : current + 1,
      ArrowLeft: current <= 0 ? last : current - 1,
      Home: 0,
      End: last,
    };
    const index = target[event.key];
    const next = index === undefined ? undefined : exhibits[index];
    if (!next) return;
    // The window listener in HallCorridor travels between halls on these keys.
    event.stopPropagation();
    event.preventDefault();
    onFocus(next.id);
    document.getElementById(exhibitTabId(next.id))?.focus();
  }

  return (
    <div className="exhibit-tabs" role="tablist" aria-label="Exhibits in this hall" onKeyDown={move}>
      {exhibits.map((node) => {
        const selected = node.id === selectedId;
        return (
          <button
            key={node.id}
            id={exhibitTabId(node.id)}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={EXHIBIT_PANEL_ID}
            tabIndex={selected ? 0 : -1}
            className={node.startYear > year ? "ghost" : undefined}
            title={node.title}
            onClick={() => onFocus(node.id)}
          >
            <span className="tab-year">{node.startYear}</span>
            <span className="tab-title">{node.title}</span>
          </button>
        );
      })}
    </div>
  );
}
