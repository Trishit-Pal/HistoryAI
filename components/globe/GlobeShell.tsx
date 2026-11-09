"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSource } from "../../src/atlas/sources";
import { statsAt } from "../../src/globe/stats";
import type { GlobeRecord, GlobeSnapshot } from "../../src/globe/types";
import { hasWebGL, usePrefersReducedMotion } from "../../src/museum/env";
import { FIRST_YEAR, LAST_YEAR, byYear, countLine, firstYear, flopPower, times, yearLabel } from "./format";
import { CountryPanel, ModelList } from "./GlobePanel";
import { GlobeRanking } from "./GlobeRanking";
import { GlobeTable } from "./GlobeTable";

const GlobeScene = dynamic(() => import("./GlobeScene").then((mod) => mod.GlobeScene), {
  ssr: false,
  loading: () => (
    <p className="globe-loading" role="status">
      Loading the globe…
    </p>
  ),
});

const SCENE_LABEL =
  "Globe with a gold column per country; taller means more models trained on at least 10^23 FLOP. The ranking beside it and the table below list the same countries.";

// One record, labelled as Epoch's estimate and linked to its source; marked when it is below the globe's threshold.
function RecordFacts({ record, threshold }: { record: GlobeRecord; threshold: number }) {
  return (
    <>
      <span className="globe-record-name">{record.name}</span> ≈ 10<sup>{flopPower(record.logCompute)}</sup> FLOP
      {record.logCompute < threshold ? (
        <>
          {" "}
          (below 10<sup>{threshold}</sup>)
        </>
      ) : null}{" "}
      · Epoch AI estimate
      {record.multiplier === null ? null : (
        <span className="globe-record-times"> {times(record.multiplier)} over the previous record</span>
      )}
      {record.link ? (
        <>
          {" "}
          <a href={record.link} target="_blank" rel="noopener noreferrer">
            Source<span className="sr-only"> for {record.name}</span>
          </a>
        </>
      ) : null}
    </>
  );
}

function Records({ snapshot, year }: { snapshot: GlobeSnapshot; year: number }) {
  const set = snapshot.records.filter((record) => record.year === year);
  const standing = statsAt(snapshot, year).largest;
  return (
    <div className="globe-records" aria-live="polite">
      <h2 className="sr-only">Compute records</h2>
      {set.length > 0 ? (
        <ol>
          {set.map((record) => (
            <li key={`${record.name}|${record.date}`}>
              <RecordFacts record={record} threshold={snapshot.threshold} />
            </li>
          ))}
        </ol>
      ) : standing ? (
        <p>
          No new record in {year}. The largest run is still {standing.year}&rsquo;s{" "}
          <RecordFacts record={standing} threshold={snapshot.threshold} />
        </p>
      ) : null}
    </div>
  );
}

export function GlobeShell({ snapshot }: { snapshot: GlobeSnapshot }) {
  const reduced = usePrefersReducedMotion();
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [year, setYear] = useState(LAST_YEAR);
  const [selected, setSelected] = useState<string | null>(null);
  const [focus, setFocus] = useState<{ lat: number; lon: number; seq: number } | null>(null);
  const epoch = getSource("epoch-ai-models");

  useEffect(() => setWebgl(hasWebGL()), []);

  const select = useCallback(
    (name: string) => {
      const country = snapshot.countries.find((candidate) => candidate.country === name);
      if (!country) return;
      setSelected(name);
      setFocus((current) => ({ lat: country.lat, lon: country.lon, seq: (current?.seq ?? 0) + 1 }));
    },
    [snapshot],
  );
  const close = useCallback(() => setSelected(null), []);
  const country = useMemo(() => snapshot.countries.find((c) => c.country === selected) ?? null, [snapshot, selected]);
  const line = countLine(snapshot, year);
  const multinational = snapshot.multinational.filter((model) => model.year <= year);

  return (
    <main className="night globe">
      <header className="globe-intro">
        <h1>Who builds the frontier</h1>
        <p>
          Every model trained with at least 10<sup>23</sup> FLOP, by the country of its lab. Move the year to
          watch large-scale AI spread from one country in {firstYear(snapshot)}.
        </p>
      </header>

      <section className="globe-stage" data-webgl={webgl === false ? "false" : undefined} aria-label="The globe and its year">
        <div className="globe-canvas" role="img" aria-label={SCENE_LABEL} hidden={webgl === false}>
          {webgl ? (
            <GlobeScene countries={snapshot.countries} year={year} selected={selected} reduced={reduced} focus={focus} onSelect={select} />
          ) : null}
        </div>
        <div className="globe-side">
          <div className="globe-controls">
            <label htmlFor="globe-year">Choose a year</label>
            <output htmlFor="globe-year" className="globe-year">
              {year}
              {year === LAST_YEAR ? <span> to 1 Nov</span> : null}
            </output>
            <input
              id="globe-year"
              type="range"
              min={FIRST_YEAR}
              max={LAST_YEAR}
              step={1}
              value={year}
              aria-valuetext={yearLabel(year)}
              onChange={(event) => setYear(Number(event.target.value))}
            />
            <p className="globe-count" aria-live="polite">
              {line.text}
              {line.growth === null ? null : (
                <span className="globe-growth">
                  {" "}
                  · largest run {line.growth.more ? "more than " : ""}×10<sup>{line.growth.power}</sup> since{" "}
                  {line.growth.since}
                </span>
              )}
            </p>
            <Records snapshot={snapshot} year={year} />
          </div>
          <GlobeRanking
            countries={snapshot.countries}
            year={year}
            threshold={snapshot.threshold}
            selected={selected}
            onSelect={select}
          />
          {country ? <CountryPanel country={country} year={year} onClose={close} /> : null}
        </div>
      </section>

      <section className="globe-block">
        <h2>Countries</h2>
        <GlobeTable countries={snapshot.countries} year={year} selected={selected} onSelect={select} />
      </section>

      <section className="globe-block" aria-labelledby="globe-multinational">
        <h2 id="globe-multinational">Multinational</h2>
        <p className="globe-note">Epoch lists these labs as multinational, so they have no pin.</p>
        {multinational.length > 0 ? <ModelList models={multinational} idPrefix="globe-multi" /> : <p className="globe-note">None {byYear(year)}.</p>}
      </section>

      <footer className="globe-block globe-credit">
        <p>
          Data:{" "}
          <a href={epoch.homepage} target="_blank" rel="noopener noreferrer">
            {epoch.name}
          </a>
          . {epoch.attribution} Licensed{" "}
          <a href={epoch.licenceUrl} target="_blank" rel="noopener noreferrer">
            CC BY 4.0
          </a>
          . Copied on {snapshot.generatedAt}, up to 1 Nov 2026. Compute figures are Epoch AI estimates.
        </p>
        <p>Pins mark countries, not lab locations.</p>
        <p>Imagery: NASA Blue Marble, public domain.</p>
      </footer>
    </main>
  );
}
