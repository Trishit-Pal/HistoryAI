"use client";

export const YEAR_MIN = 1843;
export const YEAR_MAX = 2026;

const TICK_EVERY = 10;
const LABEL_EVERY = 50;

const TICKS = Array.from({ length: Math.floor(YEAR_MAX / TICK_EVERY) + 1 }, (_, i) => i * TICK_EVERY)
  .filter((year) => year > YEAR_MIN && year < YEAR_MAX)
  .map((year) => ({
    year,
    percent: ((year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * 100,
    labelled: year % LABEL_EVERY === 0,
  }));

// The year rail drawn as the scale bar of a plan: a tick per decade, a figure per half century.
export function YearScale({ year, onYear }: { year: number; onYear: (year: number) => void }) {
  return (
    <div className="year-scale">
      <div className="ticks" aria-hidden="true">
        {TICKS.map((tick) => (
          <span key={tick.year} className={tick.labelled ? "tick major" : "tick"} style={{ left: `${tick.percent}%` }}>
            {tick.labelled ? <span className="tick-label">{tick.year}</span> : null}
          </span>
        ))}
      </div>
      <input
        id="year"
        type="range"
        min={YEAR_MIN}
        max={YEAR_MAX}
        value={year}
        onChange={(event) => onYear(Number(event.target.value))}
      />
    </div>
  );
}
