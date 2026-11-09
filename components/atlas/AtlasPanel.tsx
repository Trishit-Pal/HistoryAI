"use client";

import Link from "next/link";
import { type ModelFacts, describeCoverage } from "../../src/atlas/describe";
import type { GovernanceView } from "../../src/atlas/governance";
import { VIEW_PRESETS, type ViewPresetName, YEAR_AXIS } from "../../src/atlas/projection";
import type { LandmarkExhibit } from "../../src/atlas/landmarks";
import type { AtlasMetric, AtlasTotals } from "../../src/atlas/types";

const METRIC_LABEL: Record<AtlasMetric, string> = {
  compute: "Training compute",
  parameters: "Parameters",
};

interface ControlsProps {
  metric: AtlasMetric;
  cutoff: number;
  totals: AtlasTotals;
  showAll: boolean;
  /** Featured models drawn for the current measure. */
  drawn: number;
  /** False only once the browser is known to have no 3D view; the step buttons would have nothing to move. */
  canView: boolean;
  onMetric: (metric: AtlasMetric) => void;
  onShowAll: (showAll: boolean) => void;
  onCutoff: (year: number) => void;
  /** Move to the previous (-1) or next (1) model, oldest first. */
  onStep: (direction: -1 | 1) => void;
}

const VIEW_LABEL: Record<ViewPresetName, string> = { front: "Front", top: "Top", side: "Side" };

interface ViewsProps {
  onView: (preset: ViewPresetName) => void;
  onReset: () => void;
}

/** The preset views and the way back, on the plot's corner where a lost visitor looks. */
export function AtlasViews({ onView, onReset }: ViewsProps) {
  return (
    <div className="atlas-views" role="group" aria-label="View from">
      {(Object.keys(VIEW_PRESETS) as ViewPresetName[]).map((preset) => (
        <button key={preset} type="button" onClick={() => onView(preset)}>
          {VIEW_LABEL[preset]}
        </button>
      ))}
      <button type="button" className="atlas-reset" onClick={onReset}>
        Back to the whole plot
      </button>
    </div>
  );
}

export function AtlasControls({ metric, cutoff, totals, showAll, drawn, canView, onMetric, onShowAll, onCutoff, onStep }: ControlsProps) {
  return (
    <div className="atlas-controls">
      <fieldset>
        <legend>Height shows</legend>
        {(Object.keys(METRIC_LABEL) as AtlasMetric[]).map((option) => (
          <button key={option} type="button" aria-pressed={metric === option} onClick={() => onMetric(option)}>
            {METRIC_LABEL[option]}
          </button>
        ))}
      </fieldset>

      <fieldset>
        <legend>Which models</legend>
        <button type="button" aria-pressed={showAll} onClick={() => onShowAll(!showAll)}>
          Show all models
        </button>
      </fieldset>

      <label className="atlas-year">
        <span>
          Models after <output>{Math.floor(cutoff)}</output> are dimmed
        </span>
        <input
          type="range"
          min={YEAR_AXIS.min}
          max={YEAR_AXIS.max}
          step={1}
          value={cutoff}
          onChange={(event) => onCutoff(Number(event.target.value))}
        />
      </label>

      <p className="atlas-coverage">{describeCoverage({ metric, totals, showAll, drawn })}</p>

      {canView ? (
        <fieldset>
          <legend>Step through models</legend>
          <button type="button" onClick={() => onStep(-1)}>
            Previous model
          </button>
          <button type="button" onClick={() => onStep(1)}>
            Next model
          </button>
        </fieldset>
      ) : null}
    </div>
  );
}

interface DetailProps {
  facts: ModelFacts | null;
  exhibit?: LandmarkExhibit;
  /** A selected governance marker. It takes the panel over from the model. */
  marker?: GovernanceView | null;
}

function GovernanceDetail({ marker }: { marker: GovernanceView }) {
  const [what, ...rest] = marker.dateMeans.split(";");
  const note = rest.join(";").trim();
  return (
    <>
      <h2>{marker.title}</h2>
      <dl>
        <dt>{what}</dt>
        <dd>{marker.date}</dd>
        <dt>Issued by</dt>
        <dd>{marker.issuer}</dd>
      </dl>
      {note ? <p className="atlas-confidence">{note}.</p> : null}
      <p className="atlas-links">
        <a href={marker.url} target="_blank" rel="noopener noreferrer">
          The issuer&rsquo;s own page
        </a>
        {marker.exhibit ? <Link href={marker.exhibit.href}>Read the exhibit: {marker.exhibit.title}</Link> : null}
      </p>
    </>
  );
}

export function AtlasDetail({ facts, exhibit, marker }: DetailProps) {
  return (
    <div className="atlas-detail" role="status" aria-live="polite">
      {marker ? (
        <GovernanceDetail marker={marker} />
      ) : facts ? (
        <>
          <h2>{facts.name}</h2>
          <dl>
            <dt>Published</dt>
            <dd>{facts.date}</dd>
            <dt>Organisation</dt>
            <dd>{facts.organization}</dd>
            <dt>Domain</dt>
            <dd>{facts.domain}</dd>
            <dt>Training compute</dt>
            <dd>{facts.compute}</dd>
            <dt>Parameters</dt>
            <dd>{facts.parameters}</dd>
            <dt>Epoch&rsquo;s own rating</dt>
            <dd>{facts.epochConfidence}</dd>
          </dl>
          {facts.why.length > 0 ? (
            <p className="atlas-why">
              <span>Why it is here</span> {facts.why.join(", ")}
            </p>
          ) : null}
          <p className="atlas-confidence">
            Epoch AI estimate.
          </p>
          <p className="atlas-links">
            <a href={facts.link} target="_blank" rel="noopener noreferrer">
              Epoch&rsquo;s source for this model
            </a>
            {exhibit ? <Link href={exhibit.href}>Read the exhibit: {exhibit.title}</Link> : null}
          </p>
        </>
      ) : (
        <p>Hover a dot for details. Select it to fly there.</p>
      )}
    </div>
  );
}
