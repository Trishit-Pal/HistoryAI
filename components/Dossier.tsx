"use client";

import type { MuseumAnswer, MuseumNode } from "../src/museum/view";
import { FigureCredit } from "./FigureCredit";
import { HallOrderNav } from "./HallOrderNav";

export function Dossier({
  node,
  ask,
  answer,
  onAskChange,
  onAsk,
  hallLabel,
  openedLabel,
  earlier,
  later,
  onFocus,
}: {
  node?: MuseumNode;
  ask: string;
  answer: MuseumAnswer | null;
  onAskChange: (value: string) => void;
  onAsk: () => void;
  hallLabel?: string;
  openedLabel?: string | null;
  earlier?: string;
  later?: string;
  onFocus: (id: string) => void;
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
      <p className="muted years">
        {hallLabel} · {node.layer} · {node.kind} · {node.startYear}
        {node.endYear ? `–${node.endYear}` : ""}
      </p>
      {openedLabel ? <p className="years">{openedLabel}</p> : null}
      <h1>{node.title}</h1>
      <FigureCredit figure={node.figure} />
      <div className="badges">
        <span className={`badge badge-${node.confidence ?? "unset"}`}>{node.confidence ?? "unset"}</span>
        {node.incomplete ? <span className="badge">incomplete</span> : null}
      </div>
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
              <a href={citation.url}>{citation.publisher}</a>
            </li>
          ))}
        </ul>
      </section>
      <form
        className="ask"
        onSubmit={(event) => {
          event.preventDefault();
          onAsk();
        }}
      >
        <label htmlFor="ask">Ask the museum</label>
        <input id="ask" value={ask} onChange={(event) => onAskChange(event.target.value)} />
        <button type="submit">Ask</button>
      </form>
      {answer ? (
        <div className="answer" aria-live="polite">
          <p>{answer.summary}</p>
          {answer.confidence ? <p className="muted">{answer.confidence}</p> : null}
          {answer.editorialNote ? <p className="note">{answer.editorialNote}</p> : null}
          <ul>
            {answer.sources.map((url) => (
              <li key={url}>
                <a href={url}>{url}</a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}
