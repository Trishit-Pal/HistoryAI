import { KIND_BAND, type Kind, type PublicationState } from "./types.js";

export type PublicExhibit = {
  id: string;
  title: string;
  kind: Kind;
  startYear: number;
  publicationState: Extract<PublicationState, "canon" | "provisional">;
};

export type FloorRoom = {
  id: string;
  startYear: number | null;
  endYear: number | null;
  exhibitIds: string[];
};

export type Floor = {
  rooms: FloorRoom[];
  startYears: Record<string, number>;
};

function decadeOf(year: number): number {
  return Math.floor(year / 10) * 10;
}

function pedestalOrder(exhibits: PublicExhibit[]): PublicExhibit[] {
  return [...exhibits].sort((a, b) => {
    if (a.startYear !== b.startYear) return a.startYear - b.startYear;
    const kindDelta = KIND_BAND.indexOf(a.kind) - KIND_BAND.indexOf(b.kind);
    if (kindDelta !== 0) return kindDelta;
    return a.id.localeCompare(b.id);
  });
}

function roomFrom(exhibits: PublicExhibit[]): FloorRoom {
  const ordered = pedestalOrder(exhibits);
  const startYear = ordered[0]?.startYear ?? null;
  const endYear = ordered.reduce<number | null>(
    (max, exhibit) => (max === null || exhibit.startYear > max ? exhibit.startYear : max),
    null,
  );
  return {
    id: startYear === null || endYear === null ? "empty" : `${startYear}-${endYear}`,
    startYear,
    endYear,
    exhibitIds: ordered.map((exhibit) => exhibit.id),
  };
}

export function layoutRooms(exhibits: PublicExhibit[]): Floor {
  const provisional = exhibits.filter((exhibit) => exhibit.publicationState === "provisional");
  const canon = exhibits.filter((exhibit) => exhibit.publicationState === "canon");
  const byDecade = new Map<number, PublicExhibit[]>();
  for (const exhibit of canon) {
    const decade = decadeOf(exhibit.startYear);
    const group = byDecade.get(decade) ?? [];
    group.push(exhibit);
    byDecade.set(decade, group);
  }
  const decades = [...byDecade.keys()].sort((a, b) => a - b);
  const rooms: FloorRoom[] = [];
  let index = 0;
  while (index < decades.length) {
    const decade = decades[index];
    if (decade === undefined) break;
    let bucket = [...(byDecade.get(decade) ?? [])];
    let end = index;
    while (bucket.length < 3 && end + 1 < decades.length) {
      end += 1;
      const next = decades[end];
      if (next === undefined) break;
      bucket = bucket.concat(byDecade.get(next) ?? []);
    }
    rooms.push(roomFrom(bucket));
    index = end + 1;
  }
  rooms.push({
    id: "provisional",
    startYear: null,
    endYear: null,
    exhibitIds: pedestalOrder(provisional).map((exhibit) => exhibit.id),
  });
  const startYears: Record<string, number> = {};
  for (const exhibit of exhibits) startYears[exhibit.id] = exhibit.startYear;
  return { rooms, startYears };
}

export function sealRooms(floor: Floor, yearCursor: number): string[] {
  return floor.rooms
    .filter((room) => {
      if (room.id === "provisional") return yearCursor < 2023;
      return room.exhibitIds.every((id) => (floor.startYears[id] ?? 0) > yearCursor);
    })
    .map((room) => room.id);
}
