import { isRoomSealed, type Hall } from "../domain/layout";
import type { MuseumNode } from "./view";

// Where the visitor is standing: the exhibit on the plate and the hall the camera is in.
export type NavState = { focusedId: string | null; hallIndex: number };

export type NavContext = { halls: readonly Hall[]; nodes: readonly MuseumNode[]; year: number };

// A hall is sealed by the same rule as a floor room (isRoomSealed).
export function isSealed(hall: Hall, nodes: readonly MuseumNode[], year: number): boolean {
  return isRoomSealed(hall, (id) => nodes.find((node) => node.id === id)?.startYear, year);
}

function hallIndexOf(halls: readonly Hall[], id: string): number {
  return halls.findIndex((hall) => hall.exhibitIds.includes(id));
}

export function focusExhibit(state: NavState, id: string, { halls, nodes, year }: NavContext): NavState {
  const index = hallIndexOf(halls, id);
  const target = halls[index];
  const enters = target !== undefined && !isSealed(target, nodes, year);
  return { focusedId: id, hallIndex: enters ? index : state.hallIndex };
}

export function enterHall(state: NavState, index: number, { halls, nodes, year }: NavContext): NavState {
  const next = Math.max(0, Math.min(halls.length - 1, index));
  const hall = halls[next];
  if (!hall || isSealed(hall, nodes, year)) return state;
  const first = hall.exhibitIds.find((id) => {
    const node = nodes.find((item) => item.id === id);
    return node !== undefined && node.startYear <= year;
  });
  return { focusedId: first ?? state.focusedId, hallIndex: next };
}
