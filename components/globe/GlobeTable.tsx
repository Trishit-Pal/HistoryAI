import { rankAt } from "../../src/globe/stats";
import type { GlobeCountry } from "../../src/globe/types";
import { Bar } from "./Bar";
import { byYear } from "./format";

interface GlobeTableProps {
  countries: GlobeCountry[];
  year: number;
  selected: string | null;
  onSelect: (country: string) => void;
}

/** Every country on the globe, most models first: the keyboard, screen-reader and no-WebGL route. */
export function GlobeTable({ countries, year, selected, onSelect }: GlobeTableProps) {
  const rows = rankAt(countries, year);
  const leader = rows[0]?.count ?? 0;
  return (
    <table className="globe-table">
      <caption className="sr-only">Countries with a model trained on at least 10^23 FLOP, {byYear(year)}, most models first</caption>
      <thead>
        <tr>
          <th scope="col">Country</th>
          <th scope="col">Models {byYear(year)}</th>
          <th scope="col" className="globe-num">
            First
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ country, count }) => (
          <tr key={country.country} data-arrived={count > 0 || undefined}>
            <th scope="row">
              <button type="button" aria-pressed={selected === country.country} onClick={() => onSelect(country.country)}>
                {country.country}
              </button>
            </th>
            <td className="globe-table-count">
              <span className="globe-table-number">{count}</span>
              <Bar value={count} max={leader} />
            </td>
            <td className="globe-num">{country.models[0].year}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
