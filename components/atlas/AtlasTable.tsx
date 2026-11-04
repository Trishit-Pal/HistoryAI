"use client";

import Link from "next/link";
import type { KeyboardEvent } from "react";
import { describeModel } from "../../src/atlas/describe";
import type { LandmarkView } from "../../src/atlas/landmarks";
import type { AtlasSnapshot } from "../../src/atlas/types";

interface AtlasTableProps {
  atlas: AtlasSnapshot;
  /** The featured models, each with its exhibit link when it has one. */
  rows: readonly LandmarkView[];
  /** When the 3D view is available each row can fly to its model. */
  canShow: boolean;
  focused: number | null;
  onShow: (index: number) => void;
}

function moveBetweenRows(event: KeyboardEvent<HTMLTableSectionElement>) {
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
  const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button[data-show]"));
  const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
  if (at < 0) return;
  event.preventDefault();
  const next = event.key === "ArrowDown" ? at + 1 : at - 1;
  buttons[Math.min(Math.max(next, 0), buttons.length - 1)]?.focus();
}

/**
 * The featured models as text. It is the way in for keyboard and screen-reader visitors, and
 * the whole view when the browser cannot draw 3D.
 */
export function AtlasTable({ atlas, rows: featuredRows, canShow, focused, onShow }: AtlasTableProps) {
  const rows = [...featuredRows].sort((a, b) => atlas.models.years[a.index] - atlas.models.years[b.index]);

  return (
    <div className="atlas-table-wrap">
      <table className="atlas-table">
        <caption>
          The {rows.length} most significant models, oldest first.
        </caption>
        <thead>
          <tr>
            <th scope="col">Model</th>
            <th scope="col">Published</th>
            <th scope="col">Training compute</th>
            <th scope="col">Parameters</th>
            <th scope="col">Organisation</th>
            <th scope="col">Why it is here</th>
            <th scope="col">Sources</th>
          </tr>
        </thead>
        <tbody onKeyDown={moveBetweenRows}>
          {rows.map((landmark) => {
            const facts = describeModel(atlas, landmark.index);
            return (
              <tr key={landmark.index}>
                <th scope="row">
                  {canShow ? (
                    <button
                      type="button"
                      data-show
                      aria-current={focused === landmark.index ? "true" : undefined}
                      onClick={() => onShow(landmark.index)}
                    >
                      {facts.name}
                      <span className="visually-hidden"> (show in the 3D view)</span>
                    </button>
                  ) : (
                    facts.name
                  )}
                </th>
                <td>{facts.date}</td>
                <td>{facts.compute}</td>
                <td>{facts.parameters}</td>
                <td>{facts.organization}</td>
                <td>{facts.why.join(", ")}</td>
                <td>
                  <a href={facts.link} target="_blank" rel="noopener noreferrer">
                    Epoch&rsquo;s source
                  </a>
                  {landmark.exhibit ? <Link href={landmark.exhibit.href}>Exhibit: {landmark.exhibit.title}</Link> : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
