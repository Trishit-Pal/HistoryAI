import type { GlobeCountry } from "../../src/globe/types";

interface GlobeTableProps {
  countries: GlobeCountry[];
  year: number;
  selected: string | null;
  onSelect: (country: string) => void;
}

/** Every country on the globe, in the order large-scale AI reached it: the keyboard, screen-reader and no-WebGL route. */
export function GlobeTable({ countries, year, selected, onSelect }: GlobeTableProps) {
  const rows = [...countries].sort(
    (a, b) => a.models[0].date.localeCompare(b.models[0].date) || a.country.localeCompare(b.country),
  );
  return (
    <table className="globe-table">
      <caption className="sr-only">Countries with a model trained on at least 10^23 FLOP, by the end of {year}</caption>
      <thead>
        <tr>
          <th scope="col">Country</th>
          <th scope="col" className="globe-num">
            Models by {year}
          </th>
          <th scope="col" className="globe-num">
            First
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((country) => {
          const count = country.models.filter((model) => model.year <= year).length;
          return (
            <tr key={country.country} data-arrived={count > 0 || undefined}>
              <th scope="row">
                <button type="button" aria-pressed={selected === country.country} onClick={() => onSelect(country.country)}>
                  {country.country}
                </button>
              </th>
              <td className="globe-num">{count}</td>
              <td className="globe-num">{country.models[0].year}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
