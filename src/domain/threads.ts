export type HallThread = {
  fromId: string;
  toId: string;
};

type Dated = {
  id: string;
  startYear: number;
};

export function inYearIds(exhibitIds: string[], nodes: Dated[], year: number): string[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  return exhibitIds.filter((id) => {
    const node = byId.get(id);
    return Boolean(node && node.startYear <= year);
  });
}

export function hallThreads(exhibitIds: string[], nodes: Dated[], year: number): HallThread[] {
  const ids = inYearIds(exhibitIds, nodes, year);
  const threads: HallThread[] = [];
  for (let i = 0; i < ids.length - 1; i += 1) {
    const fromId = ids[i];
    const toId = ids[i + 1];
    if (fromId && toId) threads.push({ fromId, toId });
  }
  return threads;
}

export function hallNeighbors(
  exhibitIds: string[],
  nodes: Dated[],
  year: number,
  focusedId: string | null,
): { earlier?: string; later?: string } {
  const ids = inYearIds(exhibitIds, nodes, year);
  const index = focusedId ? ids.indexOf(focusedId) : -1;
  if (index < 0) return {};
  return {
    earlier: ids[index - 1],
    later: ids[index + 1],
  };
}

export function otherThreadId(thread: HallThread, focusedId: string | null): string {
  if (focusedId === thread.fromId) return thread.toId;
  if (focusedId === thread.toId) return thread.fromId;
  return thread.toId;
}
