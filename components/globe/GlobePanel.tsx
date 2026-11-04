"use client";

import { useEffect, useRef } from "react";
import { hashForModel } from "../../src/atlas/hash";
import type { GlobeCountry, GlobeModel } from "../../src/globe/types";
import { flopPower } from "./format";

/** Models by year, newest year first; each with its own labs, Epoch's estimate, its source and its Atlas dot. */
export function ModelList({ models, idPrefix }: { models: GlobeModel[]; idPrefix: string }) {
  const years = [...new Set(models.map((model) => model.year))].sort((a, b) => b - a);
  return (
    <div className="globe-models">
      {years.map((year) => (
        <section key={year} aria-labelledby={`${idPrefix}-${year}`}>
          <h3 id={`${idPrefix}-${year}`}>{year}</h3>
          <ul>
            {models
              .filter((model) => model.year === year)
              .map((model) => (
                <li key={`${model.name}|${model.date}`}>
                  <span className="globe-model-name">{model.name}</span>
                  <span className="globe-model-labs">{model.organizations.join(", ")}</span>
                  <span className="globe-model-flop">
                    ≈ 10<sup>{flopPower(model.logCompute)}</sup> FLOP · Epoch AI estimate
                  </span>
                  <span className="globe-model-links">
                    {model.link ? (
                      <a href={model.link} target="_blank" rel="noopener noreferrer">
                        Source<span className="sr-only"> for {model.name}</span>
                      </a>
                    ) : null}
                    {model.atlasName ? (
                      <a href={`/atlas${hashForModel(model.atlasName)}`}>
                        In the Atlas<span className="sr-only">: {model.name}</span>
                      </a>
                    ) : null}
                  </span>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

interface CountryPanelProps {
  country: GlobeCountry;
  year: number;
  onClose: () => void;
}

/** The picked country: a side panel beside the globe on a wide screen, a bottom sheet on a phone. */
export function CountryPanel({ country, year, onClose }: CountryPanelProps) {
  const heading = useRef<HTMLHeadingElement>(null);
  const shown = country.models.filter((model) => model.year <= year);
  const first = country.models[0]?.year;
  const id = `globe-panel-${country.country.replace(/\W+/g, "-")}`;

  // Opening moves focus to the panel, so a screen reader hears what was picked.
  useEffect(() => heading.current?.focus(), [country]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);

  return (
    <section className="globe-panel" aria-labelledby={id}>
      <header>
        <h2 id={id} ref={heading} tabIndex={-1}>
          {country.country}
        </h2>
        <button type="button" className="globe-close" onClick={onClose}>
          Close
        </button>
      </header>
      <p className="globe-panel-count">
        {shown.length === 0
          ? `Its first model at this scale arrives in ${first}.`
          : `${shown.length} ${shown.length === 1 ? "model" : "models"} at this scale by the end of ${year}.`}
      </p>
      <ModelList models={shown} idPrefix={id} />
    </section>
  );
}
