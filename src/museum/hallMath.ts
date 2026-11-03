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

const PLAN_MIN_HEIGHT = 8;
const PLAN_PADDING = 6;
const PLAN_DEPTH_RATIO = 0.9;
const PLAN_WIDTH_RATIO = 0.6;
const PLAN_TILT = 0.4;

// A high, steep view of one hall (one sheet) with all its exhibits in frame.
// Tilted a little rather than straight down, so the camera's up axis never degenerates.
export function planCamera(halls: readonly Hall[], hallIndex: number): { position: Vec3; target: Vec3 } {
  const hall = halls[hallIndex];
  const spots = (hall?.exhibitIds ?? []).map((id) => focusedPedestal(halls, hallIndex, id));
  if (spots.length === 0) {
    const front = hallOrigin(hallIndex, halls) - FIRST_PEDESTAL_SETBACK;
    return { position: [0, PLAN_MIN_HEIGHT, front + PLAN_MIN_HEIGHT * PLAN_TILT], target: [0, 0, front] };
  }
  const xs = spots.map((spot) => spot[0]);
  const zs = spots.map((spot) => spot[2]);
  const centreX = (Math.min(...xs) + Math.max(...xs)) / 2;
  const centreZ = (Math.min(...zs) + Math.max(...zs)) / 2;
  const depth = Math.max(...zs) - Math.min(...zs) + PLAN_PADDING;
  const width = Math.max(...xs) - Math.min(...xs) + PLAN_PADDING;
  const height = Math.max(PLAN_MIN_HEIGHT, depth * PLAN_DEPTH_RATIO, width * PLAN_WIDTH_RATIO);
  return {
    position: [centreX, height, centreZ + height * PLAN_TILT],
    target: [centreX, 0, centreZ],
  };
}
