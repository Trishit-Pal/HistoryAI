import type { Hall } from "../domain/layout";
import { eraSpot } from "./eraRooms";
import { precursorsLayout } from "./precursorsRoom";

export type Vec3 = [number, number, number];

const HALL_PADDING = 8;
const FIRST_PEDESTAL_SETBACK = 2;
const PEDESTAL_SIDE = 1.2;
const PRECURSORS_ID = "era_0_precursors";

export function hallLength(hall: Hall): number {
  return HALL_PADDING + hall.exhibitIds.length * hall.spacing;
}

// Halls run back along -z; each starts where the previous one ends.
export function hallOrigin(index: number, halls: readonly Hall[]): number {
  let z = 0;
  for (let i = 0; i < index; i += 1) {
    const hall = halls[i];
    if (hall) z -= hallLength(hall);
  }
  return z;
}

export function pedestalPosition(hallIndex: number, exhibitIndex: number, halls: readonly Hall[]): Vec3 {
  const spacing = halls[hallIndex]?.spacing ?? 1.8;
  const side = (exhibitIndex % 2) * 2 - 1;
  return [side * PEDESTAL_SIDE, 0, hallOrigin(hallIndex, halls) - FIRST_PEDESTAL_SETBACK - exhibitIndex * spacing];
}

export function focusedPedestal(halls: readonly Hall[], hallIndex: number, focusedId: string | null): Vec3 {
  if (focusedId) {
    for (let i = 0; i < halls.length; i += 1) {
      const hall = halls[i];
      if (!hall || !hall.exhibitIds.includes(focusedId)) continue;
      const origin = hallOrigin(i, halls);
      const spot =
        hall.id === PRECURSORS_ID
          ? precursorsLayout(hall.exhibitIds).find((item) => item.id === focusedId)
          : undefined;
      const placed = spot ?? eraSpot(hall.id, hall.exhibitIds, focusedId);
      if (placed) return [placed.x, placed.y, origin + placed.z];
      return pedestalPosition(i, hall.exhibitIds.indexOf(focusedId), halls);
    }
  }
  return [0, 0, hallOrigin(hallIndex, halls) - FIRST_PEDESTAL_SETBACK];
}

export function hallSpan(hall: Hall): string {
  if (!hall.startYear) return "";
  return ` ${hall.startYear}${hall.endYear ? `–${hall.endYear}` : "–"}`;
}

// Textures and artefacts mount only within one spot of the focus, and only in the focused hall
// (focusedIndex -1 means the focus is elsewhere).
export function loadsNear(index: number, focusedIndex: number): boolean {
  return focusedIndex >= 0 && Math.abs(index - focusedIndex) <= 1;
}
