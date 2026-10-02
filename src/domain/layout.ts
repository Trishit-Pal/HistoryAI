import { KIND_BAND, type Kind, type PublicationState } from "./types";
import { ERAS, eraById, eraForYear, type EraDefinition } from "./eras";

export type PublicExhibit = {
  id: string;
  title: string;
  kind: Kind;
  startYear: number;
  publicationState: Extract<PublicationState, "canon" | "provisional">;
  eraId?: string;
  layer?: "technical" | "context";
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

export type Hall = {
  id: string;
  label: string;
  startYear: number | null;
  endYear: number | null;
  mood: "open" | "winter" | "dense" | "empty";
  width: number;
  light: number;
  spacing: number;
  exhibitIds: string[];
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

export const ENTRANCE_PLAQUE_ID = "evt_history_overview";

function readingMembers(eraId: string, members: PublicExhibit[]): PublicExhibit[] {
  const ordered = pedestalOrder(members);
  if (eraId !== "era_0_precursors") return ordered;
  const plaque = ordered.find((exhibit) => exhibit.id === ENTRANCE_PLAQUE_ID);
  if (!plaque) return ordered;
  return [plaque, ...ordered.filter((exhibit) => exhibit.id !== ENTRANCE_PLAQUE_ID)];
}

function cues(mood: Hall["mood"]): Pick<Hall, "width" | "light" | "spacing"> {
  if (mood === "winter") return { width: 0.7, light: 0.45, spacing: 2.4 };
  if (mood === "dense") return { width: 1.2, light: 1.15, spacing: 1.1 };
  if (mood === "empty") return { width: 1, light: 0.6, spacing: 2 };
  return { width: 1, light: 1, spacing: 1.8 };
}

export function layoutHalls(exhibits: PublicExhibit[]): Hall[] {
  const publicNodes = exhibits.filter(
    (exhibit) => exhibit.publicationState === "canon" || exhibit.publicationState === "provisional",
  );
  const provisional = publicNodes.filter((exhibit) => exhibit.publicationState === "provisional");
  const placed = publicNodes.filter((exhibit) => exhibit.publicationState !== "provisional");
  const grouped = new Map<string, PublicExhibit[]>();
  for (const exhibit of placed) {
    const era = exhibit.eraId ? eraById(exhibit.eraId as EraDefinition["id"]) : eraForYear(exhibit.startYear);
    const group = grouped.get(era.id) ?? [];
    group.push(exhibit);
    grouped.set(era.id, group);
  }
  const halls: Hall[] = ERAS.filter((era) => grouped.has(era.id)).map((era) => {
    const members = readingMembers(era.id, grouped.get(era.id) ?? []);
    const earliest = members.reduce<number | null>(
      (min, exhibit) => (min === null || exhibit.startYear < min ? exhibit.startYear : min),
      null,
    );
    return {
      id: era.id,
      label: era.label,
      startYear: era.startYear === Number.NEGATIVE_INFINITY ? earliest : era.startYear,
      endYear: era.endYear,
      mood: era.mood,
      ...cues(era.mood),
      exhibitIds: members.map((exhibit) => exhibit.id),
    };
  });
  halls.push({
    id: "provisional",
    label: "Provisional hall",
    startYear: null,
    endYear: null,
    mood: "empty",
    ...cues("empty"),
    exhibitIds: pedestalOrder(provisional).map((exhibit) => exhibit.id),
  });
  return halls;
}
