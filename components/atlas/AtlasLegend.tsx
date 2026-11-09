import type { CSSProperties } from "react";
import { AXIS_TITLE } from "../../src/atlas/format";
import { YEAR_AXIS } from "../../src/atlas/projection";
import { laneColour } from "../../src/atlas/theme";
import type { AtlasMetric } from "../../src/atlas/types";

interface AtlasLegendProps {
  metric: AtlasMetric;
  domains: readonly string[];
}

const swatch = (colour: string) => ({ "--swatch": colour }) as CSSProperties;

/** How to move around, on the plot's bottom edge. It ignores the pointer, so a drag that starts on it still turns the plot. */
export function AtlasHowTo() {
  return (
    <p id="atlas-keys-hint" className="atlas-howto">
      Drag to turn the plot, scroll or pinch to zoom, and select a dot to see its details. With the plot focused, the
      arrow keys, or [ and ], step between models.
    </p>
  );
}

/** How to read the plot, always on the page under it. */
export function AtlasLegend({ metric, domains }: AtlasLegendProps) {
  return (
    <div className="atlas-legend">
      <div className="atlas-key">
        <section aria-labelledby="atlas-key-axes">
          <h2 id="atlas-key-axes">Axes</h2>
          <dl>
            <dt>Left to right</dt>
            <dd>
              Publication year, {YEAR_AXIS.min}–{YEAR_AXIS.max}
            </dd>
            <dt>Height</dt>
            <dd>{AXIS_TITLE[metric]}</dd>
            <dt>Front to back</dt>
            <dd>Domain, one row each</dd>
          </dl>
        </section>
        <section aria-labelledby="atlas-key-domains">
          <h2 id="atlas-key-domains">Domains</h2>
          <ul className="atlas-key-domains">
            {domains.map((domain, lane) => (
              <li key={domain}>
                <span className="atlas-swatch" aria-hidden="true" style={swatch(laneColour(lane))} />
                {domain}
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="atlas-key-marks">
          <h2 id="atlas-key-marks">Marks</h2>
          <ul>
            <li>
              <span className="atlas-swatch" aria-hidden="true" />A bright dot is one of the most significant models
            </li>
            <li>
              <span className="atlas-swatch is-faint" aria-hidden="true" />A faint, small dot comes after the year you
              chose, or is one of the rest shown by &ldquo;Show all models&rdquo;
            </li>
            <li>
              <span className="atlas-swatch is-winter" aria-hidden="true" />A blue band marks an AI winter
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
