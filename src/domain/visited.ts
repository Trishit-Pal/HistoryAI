import { inYearIds } from "./threads";

export function parseVisited(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

export function hallTally(
  exhibitIds: string[],
  nodes: { id: string; startYear: number }[],
  year: number,
  visited: string[],
): { opened: number; total: number } {
  const ids = inYearIds(exhibitIds, nodes, year);
  const seen = new Set(visited);
  return {
    opened: ids.filter((id) => seen.has(id)).length,
    total: ids.length,
  };
}

export function tallyLabel(tally: { opened: number; total: number }): string | null {
  if (tally.total === 0) return null;
  return `${tally.opened} of ${tally.total} opened`;
}
