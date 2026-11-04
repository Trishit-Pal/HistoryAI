import type { GlobeRecord, GlobeSnapshot } from "./types";

/** Cumulative counts through the end of `year`. A model in several countries is counted once. */
export function statsAt(
  snapshot: GlobeSnapshot,
  year: number,
): { labs: number; countries: number; models: number; largest?: GlobeRecord } {
  const labs = new Set<string>();
  const models = new Set<string>();
  let countries = 0;
  const visit = (model: { name: string; date: string; year: number; organizations: string[] }): boolean => {
    if (model.year > year) return false;
    models.add(`${model.name}|${model.date}`);
    for (const lab of model.organizations) labs.add(lab);
    return true;
  };
  for (const country of snapshot.countries) {
    // every model in a country is visited, so no short-circuit
    const seen = country.models.map(visit).some(Boolean);
    if (seen) countries += 1;
  }
  snapshot.multinational.forEach(visit);
  const largest = snapshot.records.filter((r) => r.year <= year).at(-1);
  return { labs: labs.size, countries, models: models.size, ...(largest ? { largest } : {}) };
}
