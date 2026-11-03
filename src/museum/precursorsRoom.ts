import { ENTRANCE_PLAQUE_ID } from "../domain/layout";

export { ENTRANCE_PLAQUE_ID };
export const TERRACE_RISE = 0.18;
export const TERRACE_STEP = 1.8;

export type Spot = {
  id: string;
  x: number;
  y: number;
  z: number;
};

export function precursorsLayout(exhibitIds: readonly string[]): Spot[] {
  let station = 0;
  return exhibitIds.map((id) => {
    if (id === ENTRANCE_PLAQUE_ID) return { id, x: 0, y: 0, z: TERRACE_STEP };
    const index = station;
    station += 1;
    return {
      id,
      x: ((index % 2) * 2 - 1) * 1.2,
      y: index * TERRACE_RISE,
      z: index === 0 ? 0 : -index * TERRACE_STEP,
    };
  });
}

export function precursorsCameraY(stationY: number | null): number {
  if (stationY === null) return 1.6;
  return 1.6 + stationY;
}
