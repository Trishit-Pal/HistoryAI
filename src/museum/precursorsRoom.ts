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

const LIGHT_START = { year: 1843, hex: "#f2e6c9" };
const LIGHT_END = { year: 1948, hex: "#d5dbe3" };

function rgb(hex: string): [number, number, number] {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

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

export function stationLight(year: number): string {
  const span = LIGHT_END.year - LIGHT_START.year;
  const t = Math.min(1, Math.max(0, (year - LIGHT_START.year) / span));
  const from = rgb(LIGHT_START.hex);
  const to = rgb(LIGHT_END.hex);
  const mixed = from.map((channel, index) => Math.round(channel + (to[index] - channel) * t));
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

export function precursorsCameraY(stationY: number | null): number {
  if (stationY === null) return 1.6;
  return 1.6 + stationY;
}
