import { rankAt } from "../../src/globe/stats";
import type { GlobeCountry } from "../../src/globe/types";
import { Bar } from "./Bar";
import { byYear } from "./format";

interface GlobeRankingProps {
  countries: GlobeCountry[];
  year: number;
  threshold: number;
  selected: string | null;
  onSelect: (country: string) => void;
}

/** The countries that have arrived by `year`, ranked on one linear scale, so the gaps read at a glance. */
export function GlobeRanking({ countries, year, threshold, selected, onSelect }: GlobeRankingProps) {
  const rows = rankAt(countries, year).filter((row) => row.count > 0);
  if (rows.length === 0) return null;
  const leader = rows[0].count;
  return (
    <section className="globe-ranking" aria-labelledby="globe-ranking-title">
      <h2 id="globe-ranking-title">Models per country, {byYear(year)}</h2>
      <p className="globe-ranking-note">
        Models trained with at least 10<sup>{threshold}</sup> FLOP. A model from labs in two countries counts for both.
      </p>
      <ol>
        {rows.map(({ country, count }) => (
          <li key={country.country}>
            <button type="button" aria-pressed={selected === country.country} onClick={() => onSelect(country.country)}>
              <span className="globe-ranking-name">{country.country}</span>
              <Bar value={count} max={leader} />
              <span className="globe-ranking-count">
                {count}
                <span className="sr-only"> {count === 1 ? "model" : "models"}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
