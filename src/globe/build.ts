import { firstHttpsUrl, toFractionalYear } from "../atlas/build";
import { COUNTRY_CENTROIDS } from "./countries";
import type { GlobeCountry, GlobeModel, GlobeRecord, GlobeSnapshot } from "./types";

type Row = Readonly<Record<string, string>>;

const CUTOFF = "2026-11-01";
const RECORDS_FROM = "2012-01-01";
const THRESHOLD_FLOP = 1e23;
const LOG_DECIMALS = 3;
const MULTINATIONAL = "Multinational";

interface Parsed {
  model: GlobeModel;
  compute: number;
  countries: string[];
}

const splitList = (field: string | undefined): string[] =>
  [...new Set((field ?? "").split(",").map((part) => part.trim()).filter(Boolean))];

/** A row with a real date on or before the cutoff and a positive finite compute, else undefined. */
function parseRow(row: Row, atlasNames: ReadonlySet<string>): Parsed | undefined {
  const date = (row["Publication date"] ?? "").trim();
  const year = toFractionalYear(date);
  const compute = Number(row["Training compute (FLOP)"]);
  if (year === undefined || date > CUTOFF || !Number.isFinite(compute) || compute <= 0) return undefined;

  const name = (row.Model ?? "").trim();
  const link = firstHttpsUrl(row.Link ?? "");
  const factor = 10 ** LOG_DECIMALS;
  const model: GlobeModel = {
    name,
    date,
    year: Math.floor(year),
    logCompute: Math.round(Math.log10(compute) * factor) / factor,
    organizations: splitList(row.Organization),
    ...(link ? { link } : {}),
    ...(atlasNames.has(name) ? { atlasName: name } : {}),
  };
  return { model, compute, countries: splitList(row["Country (of organization)"]) };
}

/** Running maximum of compute; ties never set a record. Same-day models: only the largest counts. */
function buildRecords(parsed: readonly Parsed[]): GlobeRecord[] {
  const ordered = parsed
    .filter((p) => p.model.date >= RECORDS_FROM)
    .sort((a, b) => a.model.date.localeCompare(b.model.date) || b.compute - a.compute);
  const records: GlobeRecord[] = [];
  let best = 0;
  for (const { model, compute } of ordered) {
    if (compute <= best) continue;
    const previous = records.at(-1);
    records.push({ ...model, multiplier: previous ? 10 ** (model.logCompute - previous.logCompute) : null });
    best = compute;
  }
  return records;
}

function buildCountries(large: readonly Parsed[]): { countries: GlobeCountry[]; multinational: GlobeModel[] } {
  const byCountry = new Map<string, GlobeModel[]>();
  const multinational: GlobeModel[] = [];
  for (const { model, countries } of large) {
    for (const country of countries) {
      if (country === MULTINATIONAL) {
        multinational.push(model);
        continue;
      }
      if (!COUNTRY_CENTROIDS[country]) throw new Error(`no centroid for "${country}"; add it to src/globe/countries.ts`);
      byCountry.set(country, [...(byCountry.get(country) ?? []), model]);
    }
  }
  const countries = [...byCountry]
    .map(([country, models]): GlobeCountry => {
      const [lat, lon] = COUNTRY_CENTROIDS[country];
      return { country, lat, lon, labs: [...new Set(models.flatMap((m) => m.organizations))].sort(), models };
    })
    .sort((a, b) => a.country.localeCompare(b.country));
  return { countries, multinational };
}

const byDate = (a: GlobeModel, b: GlobeModel): number => a.date.localeCompare(b.date) || a.name.localeCompare(b.name);

export function buildGlobe(
  rows: readonly Row[],
  meta: { generatedAt: string; atlasNames: ReadonlySet<string> },
): GlobeSnapshot {
  const parsed = rows.flatMap((row) => parseRow(row, meta.atlasNames) ?? []);
  const large = parsed.filter((p) => p.compute >= THRESHOLD_FLOP).sort((a, b) => byDate(a.model, b.model));
  const { countries, multinational } = buildCountries(large);
  return {
    generatedAt: meta.generatedAt,
    cutoff: CUTOFF,
    threshold: 23,
    countries,
    multinational,
    records: buildRecords(parsed),
  };
}
